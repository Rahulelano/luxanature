import mongoose from "mongoose";

const { Schema, model } = mongoose;

/* --------------------------------- Settings -------------------------------- */
// Single document holding everything the admin can change about the site.
const settingsSchema = new Schema(
  {
    key: { type: String, default: "site", unique: true },
    businessName: { type: String, default: "Luxa Naturals" },
    tagline: { type: String, default: "Nature. Quality. Everyday Wellness." },
    logo: { type: String, default: "/logo.png" },
    favicon: { type: String, default: "/logo.png" },
    heroImage: { type: String, default: "" },
    contactEmail: { type: String, default: "luxanaturals@gmail.com" },
    contactPhone: { type: String, default: "" },
    address: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    social: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    announcement: { type: String, default: "" },
    // Free-form wording overrides: { "hero.title1": "Nature. Quality.", ... }
    // (Plain object, not a Mongoose Map — Maps don't allow "." in keys.)
    texts: { type: Schema.Types.Mixed, default: () => ({}) },
    // Shop / payment
    currency: { type: String, default: "INR" },
    shippingFee: { type: Number, default: 0 },
    freeShippingAbove: { type: Number, default: 0 },
    codEnabled: { type: Boolean, default: true },
    razorpayEnabled: { type: Boolean, default: false },
    razorpayKeyId: { type: String, default: "" },
    razorpayKeySecret: { type: String, default: "", select: false },
    razorpayWebhookSecret: { type: String, default: "", select: false },
  },
  { timestamps: true },
);

/* -------------------------------- Category --------------------------------- */
// parent === null → top-level category, otherwise a subcategory.
const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    parent: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

/* --------------------------------- Product --------------------------------- */
const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    ingredients: { type: String, default: "" },
    benefits: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, default: 0, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, default: "" },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    subcategory: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    images: [{ type: String }],
    tag: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    rating: { type: Number, default: 5, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);
productSchema.index({ name: "text", description: "text" });

/* ---------------------------------- User ----------------------------------- */
const addressSchema = new Schema(
  {
    fullName: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    addresses: [addressSchema],
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    blocked: { type: Boolean, default: false },
    lastLoginAt: Date,
  },
  { timestamps: true },
);

/* ----------------------------------- OTP ----------------------------------- */
const otpSchema = new Schema({
  email: { type: String, required: true, lowercase: true, index: true },
  codeHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  // Mongo removes the document automatically once expiresAt passes.
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  createdAt: { type: Date, default: Date.now },
});

/* ---------------------------------- Order ---------------------------------- */
const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    name: String,
    slug: String,
    image: String,
    price: Number,
    qty: Number,
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    email: String,
    items: [orderItemSchema],
    subtotal: Number,
    shipping: Number,
    total: Number,
    address: addressSchema,
    paymentMethod: { type: String, enum: ["razorpay", "cod"], required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    status: {
      type: String,
      enum: ["pending_payment", "placed", "confirmed", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
    stockDeducted: { type: Boolean, default: false },
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: String,
    razorpaySignature: String,
    trackingNumber: { type: String, default: "" },
    notes: { type: String, default: "" },
    history: [{ status: String, at: { type: Date, default: Date.now }, note: String }],
  },
  { timestamps: true },
);

export const Settings = model("Settings", settingsSchema);
export const Category = model("Category", categorySchema);
export const Product = model("Product", productSchema);
export const User = model("User", userSchema);
export const Otp = model("Otp", otpSchema);
export const Order = model("Order", orderSchema);

export async function getSettings(withSecrets = false) {
  let q = Settings.findOne({ key: "site" });
  if (withSecrets) q = q.select("+razorpayKeySecret +razorpayWebhookSecret");
  let doc = await q;
  if (!doc) {
    await Settings.create({ key: "site" });
    doc = await (withSecrets
      ? Settings.findOne({ key: "site" }).select("+razorpayKeySecret +razorpayWebhookSecret")
      : Settings.findOne({ key: "site" }));
  }
  return doc;
}
