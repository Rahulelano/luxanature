import { Router } from "express";
import crypto from "node:crypto";
import Razorpay from "razorpay";
import { Order, Product, getSettings } from "../models/index.js";
import { asyncHandler, HttpError, requireAuth, sendMail, mailLayout, inr } from "../lib/util.js";

const router = Router();

function razorpayClient(s) {
  if (!s.razorpayEnabled || !s.razorpayKeyId || !s.razorpayKeySecret) {
    throw new HttpError(400, "Online payment is not configured. Please choose Cash on Delivery.");
  }
  return new Razorpay({ key_id: s.razorpayKeyId, key_secret: s.razorpayKeySecret });
}

const genOrderNumber = () =>
  "LX" + Date.now().toString(36).toUpperCase() + crypto.randomBytes(2).toString("hex").toUpperCase();

/** Atomically take stock for every item; rolls back if any item is short. */
async function deductStock(order) {
  if (order.stockDeducted) return;
  const done = [];
  for (const it of order.items) {
    const r = await Product.updateOne({ _id: it.product, stock: { $gte: it.qty } }, { $inc: { stock: -it.qty } });
    if (r.modifiedCount === 0) {
      for (const d of done) await Product.updateOne({ _id: d.product }, { $inc: { stock: d.qty } });
      throw new HttpError(409, `${it.name} is out of stock`);
    }
    done.push(it);
  }
  order.stockDeducted = true;
}

export async function restoreStock(order) {
  if (!order.stockDeducted) return;
  for (const it of order.items) await Product.updateOne({ _id: it.product }, { $inc: { stock: it.qty } });
  order.stockDeducted = false;
}

async function sendOrderMail(order) {
  try {
    const s = await getSettings();
    const rows = order.items
      .map((i) => `<tr><td>${i.name} × ${i.qty}</td><td align="right">${inr(i.price * i.qty)}</td></tr>`)
      .join("");
    await sendMail({
      to: order.email,
      fromName: s.businessName,
      subject: `Order ${order.orderNumber} confirmed — ${s.businessName}`,
      html: mailLayout(
        s.businessName,
        `<p>Thank you for your order! 🌿</p>
         <p><b>Order:</b> ${order.orderNumber}<br/><b>Payment:</b> ${order.paymentMethod === "cod" ? "Cash on Delivery" : "Paid online"}</p>
         <table width="100%" cellpadding="6" style="border-collapse:collapse">${rows}
           <tr><td>Shipping</td><td align="right">${inr(order.shipping)}</td></tr>
           <tr><td><b>Total</b></td><td align="right"><b>${inr(order.total)}</b></td></tr></table>`,
      ),
    });
  } catch (e) {
    console.error("Order mail failed:", e.message);
  }
}

async function markPaid(order, paymentId, signature) {
  if (order.paymentStatus === "paid") return order;
  await deductStock(order);
  order.paymentStatus = "paid";
  order.status = "placed";
  order.razorpayPaymentId = paymentId;
  if (signature) order.razorpaySignature = signature;
  order.history.push({ status: "placed", note: "Payment received" });
  await order.save();
  sendOrderMail(order);
  return order;
}

/* --------------------------------- Create ---------------------------------- */
router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { items, address, paymentMethod } = req.body;
    if (!Array.isArray(items) || items.length === 0) throw new HttpError(400, "Your cart is empty");
    if (!["razorpay", "cod"].includes(paymentMethod)) throw new HttpError(400, "Choose a payment method");
    const required = ["fullName", "phone", "line1", "city", "state", "pincode"];
    for (const f of required) if (!address?.[f]) throw new HttpError(400, `Address: ${f} is required`);

    const s = await getSettings(true);
    if (paymentMethod === "cod" && !s.codEnabled) throw new HttpError(400, "Cash on Delivery is not available");

    // Prices always come from the database, never from the browser.
    const lines = [];
    for (const it of items) {
      const qty = Math.max(1, Math.min(99, parseInt(it.qty, 10) || 1));
      const p = await Product.findOne({ _id: it.productId, active: true });
      if (!p) throw new HttpError(400, "A product in your cart is no longer available");
      if (p.stock < qty) throw new HttpError(409, `Only ${p.stock} left of ${p.name}`);
      lines.push({ product: p._id, name: p.name, slug: p.slug, image: p.images[0] || "", price: p.price, qty });
    }
    const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
    const shipping = s.freeShippingAbove > 0 && subtotal >= s.freeShippingAbove ? 0 : s.shippingFee || 0;
    const total = subtotal + shipping;

    const order = new Order({
      orderNumber: genOrderNumber(),
      user: req.user._id,
      email: req.user.email,
      items: lines,
      subtotal,
      shipping,
      total,
      address,
      paymentMethod,
    });

    if (paymentMethod === "cod") {
      await deductStock(order);
      order.status = "placed";
      order.history.push({ status: "placed", note: "Cash on Delivery" });
      await order.save();
      sendOrderMail(order);
      return res.json({ order });
    }

    // Razorpay: create a gateway order; stock is taken only after payment succeeds.
    const rzp = razorpayClient(s);
    const rzpOrder = await rzp.orders.create({
      amount: Math.round(total * 100),
      currency: s.currency || "INR",
      receipt: order.orderNumber,
      notes: { orderNumber: order.orderNumber },
    });
    order.status = "pending_payment";
    order.razorpayOrderId = rzpOrder.id;
    order.history.push({ status: "pending_payment" });
    await order.save();

    res.json({ order, razorpay: checkoutPayload(s, order, rzpOrder.amount, rzpOrder.currency) });
  }),
);

const checkoutPayload = (s, order, amount, currency) => ({
  keyId: s.razorpayKeyId,
  orderId: order.razorpayOrderId,
  amount,
  currency,
  name: s.businessName,
  logo: s.logo,
  prefill: { email: order.email, name: order.address.fullName, contact: order.address.phone },
});

// Retry payment for an order whose Razorpay popup was closed or failed.
router.post(
  "/:id/pay",
  requireAuth,
  asyncHandler(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) throw new HttpError(404, "Order not found");
    if (order.paymentMethod !== "razorpay" || order.paymentStatus === "paid" || order.status === "cancelled") {
      throw new HttpError(400, "This order does not need payment");
    }
    const s = await getSettings(true);
    const rzp = razorpayClient(s);
    // A Razorpay order accepts multiple attempts, so reuse it; create one only if missing.
    if (!order.razorpayOrderId) {
      const r = await rzp.orders.create({ amount: Math.round(order.total * 100), currency: s.currency || "INR", receipt: order.orderNumber });
      order.razorpayOrderId = r.id;
      await order.save();
    }
    res.json({ order, razorpay: checkoutPayload(s, order, Math.round(order.total * 100), s.currency || "INR") });
  }),
);

/* ------------------------- Verify Razorpay payment -------------------------- */
router.post(
  "/:id/verify",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) throw new HttpError(404, "Order not found");
    if (order.razorpayOrderId !== razorpay_order_id) throw new HttpError(400, "Order mismatch");

    const s = await getSettings(true);
    const expected = crypto
      .createHmac("sha256", s.razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    const ok =
      typeof razorpay_signature === "string" &&
      expected.length === razorpay_signature.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));
    if (!ok) {
      order.paymentStatus = "failed";
      await order.save();
      throw new HttpError(400, "Payment verification failed");
    }
    await markPaid(order, razorpay_payment_id, razorpay_signature);
    res.json({ order });
  }),
);

/* ----------------------------- Customer orders ------------------------------ */
router.get(
  "/mine",
  requireAuth,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ orders });
  }),
);

router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const q = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, user: req.user._id };
    const order = await Order.findOne(q).lean();
    if (!order) throw new HttpError(404, "Order not found");
    res.json({ order });
  }),
);

router.post(
  "/:id/cancel",
  requireAuth,
  asyncHandler(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) throw new HttpError(404, "Order not found");
    if (!["pending_payment", "placed", "confirmed"].includes(order.status)) {
      throw new HttpError(400, "This order can no longer be cancelled");
    }
    await restoreStock(order);
    order.status = "cancelled";
    order.history.push({ status: "cancelled", note: "Cancelled by customer" });
    await order.save();
    res.json({ order });
  }),
);

/* ---------------------- Razorpay webhook (raw body) ------------------------- */
// Safety net: marks the order paid even if the customer closed the browser
// before /verify ran. Configure in Razorpay Dashboard → Webhooks →
// URL: https://<your-domain>/api/payments/webhook, event: payment.captured
export const razorpayWebhook = asyncHandler(async (req, res) => {
  const s = await getSettings(true);
  if (!s.razorpayWebhookSecret) return res.status(200).json({ ignored: true });
  const sig = req.headers["x-razorpay-signature"];
  const expected = crypto.createHmac("sha256", s.razorpayWebhookSecret).update(req.body).digest("hex");
  if (sig !== expected) return res.status(400).json({ error: "bad signature" });

  const event = JSON.parse(req.body.toString("utf8"));
  if (event.event === "payment.captured" || event.event === "order.paid") {
    const pay = event.payload.payment?.entity;
    const order = pay && (await Order.findOne({ razorpayOrderId: pay.order_id }));
    if (order) await markPaid(order, pay.id);
  }
  res.json({ ok: true });
});

export default router;
