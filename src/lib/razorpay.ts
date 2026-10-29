import { api, type Order } from "./api";

type RazorpayPayload = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  logo: string;
  prefill: { email: string; name: string; contact: string };
};

declare global {
  interface Window {
    Razorpay?: any;
  }
}

function loadScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load Razorpay. Check your internet connection."));
    document.body.appendChild(s);
  });
}

/**
 * Opens Razorpay Checkout for an order and verifies the payment on our server.
 * Resolves with the paid order, rejects if the customer closes the popup or payment fails.
 */
export async function payWithRazorpay(orderId: string, rp: RazorpayPayload): Promise<Order> {
  await loadScript();
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: rp.keyId,
      order_id: rp.orderId,
      amount: rp.amount,
      currency: rp.currency,
      name: rp.name,
      image: rp.logo?.startsWith("http") ? rp.logo : window.location.origin + rp.logo,
      prefill: rp.prefill,
      theme: { color: "#6B8E23" },
      handler: async (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        try {
          const r = await api<{ order: Order }>(`/orders/${orderId}/verify`, { body: resp });
          resolve(r.order);
        } catch (e) {
          reject(e);
        }
      },
      modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
    });
    // On "payment.failed" Razorpay shows the error and lets the customer retry inside
    // the same popup, so we only settle on success (handler) or close (ondismiss).
    rzp.open();
  });
}
