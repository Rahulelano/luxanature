import { Router } from "express";
import crypto from "node:crypto";
import { Otp, User, getSettings } from "../models/index.js";
import {
  asyncHandler,
  HttpError,
  setAuthCookie,
  clearAuthCookie,
  requireAuth,
  isAdminEmail,
  sendMail,
  mailLayout,
} from "../lib/util.js";

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hash = (code) => crypto.createHash("sha256").update(code + process.env.JWT_SECRET).digest("hex");

export const publicUser = (u) => ({
  id: u._id,
  email: u.email,
  name: u.name,
  phone: u.phone,
  role: u.role,
  addresses: u.addresses,
  wishlist: u.wishlist,
});

// Step 1: send a 6-digit code to the email
router.post(
  "/request-otp",
  asyncHandler(async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) throw new HttpError(400, "Enter a valid email address");

    const recent = await Otp.findOne({ email, createdAt: { $gt: new Date(Date.now() - 60_000) } });
    if (recent) throw new HttpError(429, "Please wait a minute before requesting another code");

    const code = String(crypto.randomInt(100000, 1000000));
    await Otp.deleteMany({ email });
    await Otp.create({ email, codeHash: hash(code), expiresAt: new Date(Date.now() + 10 * 60_000) });

    const s = await getSettings();
    await sendMail({
      to: email,
      fromName: s.businessName,
      subject: `${code} is your ${s.businessName} login code`,
      html: mailLayout(
        s.businessName,
        `<p>Your one-time login code is:</p>
         <p style="font-size:32px;letter-spacing:8px;font-weight:bold;color:#6B8E23">${code}</p>
         <p>This code expires in 10 minutes. If you didn't request it, you can ignore this email.</p>`,
      ),
    });
    res.json({ ok: true });
  }),
);

// Step 2: verify code → create user if new → set cookie
router.post(
  "/verify-otp",
  asyncHandler(async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const code = String(req.body.code || "").trim();
    const otp = await Otp.findOne({ email });
    if (!otp || otp.expiresAt < new Date()) throw new HttpError(400, "Code expired. Request a new one.");
    if (otp.attempts >= 5) {
      await otp.deleteOne();
      throw new HttpError(429, "Too many wrong attempts. Request a new code.");
    }
    if (otp.codeHash !== hash(code)) {
      otp.attempts += 1;
      await otp.save();
      throw new HttpError(400, "Incorrect code");
    }
    await otp.deleteOne();

    let user = await User.findOne({ email });
    if (!user) user = new User({ email });
    if (user.blocked) throw new HttpError(403, "This account is blocked");
    if (isAdminEmail(email)) user.role = "admin";
    user.lastLoginAt = new Date();
    await user.save();

    setAuthCookie(res, user);
    res.json({ user: publicUser(user) });
  }),
);

router.get("/me", (req, res) => res.json({ user: req.user ? publicUser(req.user) : null }));

router.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

/* ------------------------------ Profile / address ----------------------------- */
router.put(
  "/profile",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, phone } = req.body;
    if (name !== undefined) req.user.name = String(name).slice(0, 100);
    if (phone !== undefined) req.user.phone = String(phone).slice(0, 20);
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  }),
);

const pickAddress = (b) => ({
  fullName: b.fullName,
  phone: b.phone,
  line1: b.line1,
  line2: b.line2,
  city: b.city,
  state: b.state,
  pincode: b.pincode,
  isDefault: !!b.isDefault,
});

router.post(
  "/addresses",
  requireAuth,
  asyncHandler(async (req, res) => {
    const a = pickAddress(req.body);
    if (a.isDefault || req.user.addresses.length === 0) {
      req.user.addresses.forEach((x) => (x.isDefault = false));
      a.isDefault = true;
    }
    req.user.addresses.push(a);
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  }),
);

router.put(
  "/addresses/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const addr = req.user.addresses.id(req.params.id);
    if (!addr) throw new HttpError(404, "Address not found");
    const a = pickAddress(req.body);
    if (a.isDefault) req.user.addresses.forEach((x) => (x.isDefault = false));
    addr.set(a);
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  }),
);

router.delete(
  "/addresses/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    req.user.addresses.pull(req.params.id);
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  }),
);

router.post(
  "/wishlist/:productId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = req.params.productId;
    const has = req.user.wishlist.some((w) => w.toString() === id);
    if (has) req.user.wishlist.pull(id);
    else req.user.wishlist.push(id);
    await req.user.save();
    res.json({ user: publicUser(req.user), added: !has });
  }),
);

router.get(
  "/wishlist",
  requireAuth,
  asyncHandler(async (req, res) => {
    await req.user.populate({ path: "wishlist", match: { active: true }, populate: "category" });
    res.json({ products: req.user.wishlist });
  }),
);

export default router;
