import { Router } from "express";
import { Category, Product, getSettings } from "../models/index.js";
import { asyncHandler, HttpError } from "../lib/util.js";

const router = Router();

// Public site settings — secrets are never included.
export function publicSettings(s) {
  const o = s.toObject();
  delete o.razorpayKeySecret;
  delete o.razorpayWebhookSecret;
  o.texts = s.texts || {};
  // Only expose that Razorpay is usable, plus the public key id.
  o.razorpayEnabled = !!(s.razorpayEnabled && s.razorpayKeyId);
  return o;
}

router.get(
  "/settings",
  asyncHandler(async (_req, res) => {
    res.json({ settings: publicSettings(await getSettings()) });
  }),
);

// Categories as a tree: [{...category, children: [...subcategories]}]
router.get(
  "/categories",
  asyncHandler(async (req, res) => {
    const filter = req.query.all === "1" ? {} : { active: true };
    const cats = await Category.find(filter).sort({ order: 1, name: 1 }).lean();
    const top = cats.filter((c) => !c.parent);
    const tree = top.map((c) => ({
      ...c,
      children: cats.filter((s) => s.parent && s.parent.toString() === c._id.toString()),
    }));
    res.json({ categories: tree });
  }),
);

router.get(
  "/categories/:slug",
  asyncHandler(async (req, res) => {
    const cat = await Category.findOne({ slug: req.params.slug, active: true }).lean();
    if (!cat) throw new HttpError(404, "Category not found");
    const children = await Category.find({ parent: cat._id, active: true }).sort({ order: 1, name: 1 }).lean();
    res.json({ category: { ...cat, children } });
  }),
);

router.get(
  "/products",
  asyncHandler(async (req, res) => {
    const { category, sub, q, featured, bestSeller, sort, limit } = req.query;
    const filter = { active: true };

    if (category) {
      const c = await Category.findOne({ slug: category });
      if (!c) return res.json({ products: [] });
      filter.category = c._id;
    }
    if (sub) {
      const s = await Category.findOne({ slug: sub });
      if (!s) return res.json({ products: [] });
      filter.subcategory = s._id;
    }
    if (q) filter.name = { $regex: String(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    if (featured === "1") filter.featured = true;
    if (bestSeller === "1") filter.bestSeller = true;

    const sortMap = {
      new: { createdAt: -1 },
      priceAsc: { price: 1 },
      priceDesc: { price: -1 },
      name: { name: 1 },
    };
    const products = await Product.find(filter)
      .sort(sortMap[sort] || { createdAt: -1 })
      .limit(Math.min(Number(limit) || 200, 200))
      .populate("category", "name slug")
      .populate("subcategory", "name slug")
      .lean();
    res.json({ products });
  }),
);

router.get(
  "/products/:slug",
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug, active: true })
      .populate("category", "name slug")
      .populate("subcategory", "name slug")
      .lean();
    if (!product) throw new HttpError(404, "Product not found");
    const related = await Product.find({ category: product.category._id, _id: { $ne: product._id }, active: true })
      .limit(4)
      .populate("category", "name slug")
      .lean();
    res.json({ product, related });
  }),
);

export default router;
