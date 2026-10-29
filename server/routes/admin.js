import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import Razorpay from "razorpay";
import { Category, Product, Order, User, getSettings } from "../models/index.js";
import { asyncHandler, HttpError, requireAdmin, slugify } from "../lib/util.js";
import { publicSettings } from "./catalog.js";
import { restoreStock } from "./orders.js";

export const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const router = Router();
router.use(requireAdmin);

/* --------------------------------- Uploads --------------------------------- */
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
      const base = slugify(path.basename(file.originalname, ext)).slice(0, 40) || "image";
      cb(null, `${Date.now()}-${crypto.randomBytes(3).toString("hex")}-${base}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(png|jpe?g|webp|gif|svg\+xml|x-icon|vnd\.microsoft\.icon)$/.test(file.mimetype);
    cb(ok ? null : new HttpError(400, "Only image files are allowed"), ok);
  },
});

// POST /api/admin/upload  (field name: "files", up to 10) → { urls: ["/uploads/..."] }
router.post("/upload", upload.array("files", 10), (req, res) => {
  res.json({ urls: (req.files || []).map((f) => `/uploads/${f.filename}`) });
});

/* -------------------------------- Settings --------------------------------- */
router.get(
  "/settings",
  asyncHandler(async (_req, res) => {
    const s = await getSettings(true);
    const o = publicSettings(s);
    o.razorpayEnabled = s.razorpayEnabled;
    // Show only whether secrets are set, never the secrets themselves.
    o.hasRazorpaySecret = !!s.razorpayKeySecret;
    o.hasWebhookSecret = !!s.razorpayWebhookSecret;
    res.json({ settings: o });
  }),
);

const SETTINGS_FIELDS = [
  "businessName", "tagline", "logo", "favicon", "heroImage", "contactEmail", "contactPhone", "address",
  "whatsapp", "social", "announcement", "currency", "shippingFee", "freeShippingAbove", "codEnabled",
  "razorpayEnabled", "razorpayKeyId",
];

router.put(
  "/settings",
  asyncHandler(async (req, res) => {
    const s = await getSettings(true);
    for (const f of SETTINGS_FIELDS) if (req.body[f] !== undefined) s.set(f, req.body[f]);
    if (req.body.texts && typeof req.body.texts === "object") {
      const texts = { ...(s.texts || {}) };
      for (const [k, v] of Object.entries(req.body.texts)) {
        if (v === "" || v === null) delete texts[k];
        else texts[k] = String(v);
      }
      s.texts = texts;
      s.markModified("texts");
    }
    // Secrets are write-only: empty string keeps the existing one.
    if (req.body.razorpayKeySecret) s.razorpayKeySecret = String(req.body.razorpayKeySecret).trim();
    if (req.body.razorpayWebhookSecret) s.razorpayWebhookSecret = String(req.body.razorpayWebhookSecret).trim();
    if (s.razorpayKeyId) s.razorpayKeyId = s.razorpayKeyId.trim();
    await s.save();
    res.json({ settings: publicSettings(s) });
  }),
);

// Check that the saved Razorpay keys actually work.
router.post(
  "/settings/test-razorpay",
  asyncHandler(async (_req, res) => {
    const s = await getSettings(true);
    if (!s.razorpayKeyId || !s.razorpayKeySecret) throw new HttpError(400, "Save Key ID and Key Secret first");
    try {
      const rzp = new Razorpay({ key_id: s.razorpayKeyId, key_secret: s.razorpayKeySecret });
      await rzp.orders.all({ count: 1 });
      res.json({ ok: true, mode: s.razorpayKeyId.startsWith("rzp_live_") ? "live" : "test" });
    } catch (e) {
      throw new HttpError(400, "Razorpay rejected these keys: " + (e?.error?.description || e.message));
    }
  }),
);

/* ------------------------------- Categories -------------------------------- */
async function uniqueSlug(Model, base, excludeId) {
  let slug = slugify(base) || "item";
  let n = 1;
  while (await Model.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) slug = `${slugify(base)}-${++n}`;
  return slug;
}

const pickCategory = (b) => ({
  name: b.name,
  description: b.description ?? "",
  image: b.image ?? "",
  parent: b.parent || null,
  order: Number(b.order) || 0,
  active: b.active !== false,
});

router.post(
  "/categories",
  asyncHandler(async (req, res) => {
    if (!req.body.name) throw new HttpError(400, "Name is required");
    const data = pickCategory(req.body);
    data.slug = await uniqueSlug(Category, req.body.slug || req.body.name);
    res.json({ category: await Category.create(data) });
  }),
);

router.put(
  "/categories/:id",
  asyncHandler(async (req, res) => {
    const cat = await Category.findById(req.params.id);
    if (!cat) throw new HttpError(404, "Category not found");
    const data = pickCategory({ ...cat.toObject(), ...req.body });
    if (data.parent && data.parent.toString() === cat._id.toString()) throw new HttpError(400, "A category can't be its own parent");
    if (req.body.slug || req.body.name !== cat.name) data.slug = await uniqueSlug(Category, req.body.slug || data.name, cat._id);
    cat.set(data);
    await cat.save();
    res.json({ category: cat });
  }),
);

router.delete(
  "/categories/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const inUse = await Product.countDocuments({ $or: [{ category: id }, { subcategory: id }] });
    if (inUse) throw new HttpError(400, `${inUse} product(s) use this category. Move or delete them first.`);
    const subs = await Category.countDocuments({ parent: id });
    if (subs) throw new HttpError(400, "Delete its subcategories first");
    await Category.findByIdAndDelete(id);
    res.json({ ok: true });
  }),
);

/* -------------------------------- Products --------------------------------- */
router.get(
  "/products",
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.q) filter.name = { $regex: String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    if (req.query.category) filter.category = req.query.category;
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .populate("category", "name slug")
      .populate("subcategory", "name slug")
      .lean();
    res.json({ products });
  }),
);

const pickProduct = (b) => ({
  name: b.name,
  description: b.description ?? "",
  ingredients: b.ingredients ?? "",
  benefits: b.benefits ?? "",
  price: Number(b.price) || 0,
  mrp: Number(b.mrp) || 0,
  stock: Math.max(0, parseInt(b.stock, 10) || 0),
  sku: b.sku ?? "",
  category: b.category,
  subcategory: b.subcategory || null,
  images: Array.isArray(b.images) ? b.images.filter(Boolean) : [],
  tag: b.tag ?? "",
  featured: !!b.featured,
  bestSeller: !!b.bestSeller,
  active: b.active !== false,
  rating: Math.min(5, Math.max(0, Number(b.rating ?? 5))),
  reviewsCount: parseInt(b.reviewsCount, 10) || 0,
});

router.post(
  "/products",
  asyncHandler(async (req, res) => {
    if (!req.body.name || !req.body.category) throw new HttpError(400, "Name and category are required");
    const data = pickProduct(req.body);
    data.slug = await uniqueSlug(Product, req.body.slug || req.body.name);
    res.json({ product: await Product.create(data) });
  }),
);

router.put(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const p = await Product.findById(req.params.id);
    if (!p) throw new HttpError(404, "Product not found");
    const data = pickProduct({ ...p.toObject(), ...req.body });
    if (req.body.slug || req.body.name !== p.name) data.slug = await uniqueSlug(Product, req.body.slug || data.name, p._id);
    p.set(data);
    await p.save();
    res.json({ product: p });
  }),
);

router.delete(
  "/products/:id",
  asyncHandler(async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  }),
);

/* --------------------------------- Orders ---------------------------------- */
router.get(
  "/orders",
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.q) {
      const re = new RegExp(String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ orderNumber: re }, { email: re }];
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(500).lean();
    res.json({ orders });
  }),
);

router.put(
  "/orders/:id",
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) throw new HttpError(404, "Order not found");
    const { status, paymentStatus, trackingNumber, notes } = req.body;
    if (status && status !== order.status) {
      if (status === "cancelled") await restoreStock(order);
      order.status = status;
      order.history.push({ status, note: "Updated by admin" });
    }
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (notes !== undefined) order.notes = notes;
    await order.save();
    res.json({ order });
  }),
);

/* ---------------------------------- Users ---------------------------------- */
router.get(
  "/users",
  asyncHandler(async (_req, res) => {
    const users = await User.find().sort({ createdAt: -1 }).limit(1000).lean();
    const counts = await Order.aggregate([{ $group: { _id: "$user", n: { $sum: 1 } } }]);
    const map = Object.fromEntries(counts.map((c) => [c._id.toString(), c.n]));
    res.json({ users: users.map((u) => ({ ...u, orders: map[u._id.toString()] || 0 })) });
  }),
);

router.put(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const u = await User.findById(req.params.id);
    if (!u) throw new HttpError(404, "User not found");
    if (u._id.equals(req.user._id)) throw new HttpError(400, "You can't change your own account here");
    if (req.body.role) u.role = req.body.role === "admin" ? "admin" : "user";
    if (req.body.blocked !== undefined) u.blocked = !!req.body.blocked;
    await u.save();
    res.json({ user: u });
  }),
);

/* ---------------------------------- Stats ---------------------------------- */
router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const [products, users, orders, revenueAgg, lowStock, recent] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Order.countDocuments({ status: { $ne: "pending_payment" } }),
      Order.aggregate([
        { $match: { status: { $nin: ["cancelled", "pending_payment"] } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Product.find({ stock: { $lte: 5 } }).select("name stock").limit(10).lean(),
      Order.find({ status: { $ne: "pending_payment" } }).sort({ createdAt: -1 }).limit(8).lean(),
    ]);
    res.json({ products, users, orders, revenue: revenueAgg[0]?.total || 0, lowStock, recent });
  }),
);

export default router;
