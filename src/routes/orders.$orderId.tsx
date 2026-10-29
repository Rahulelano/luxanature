import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Circle } from "lucide-react";
import { api, inr, STATUS_LABEL, type Order } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { payWithRazorpay } from "@/lib/razorpay";

export const Route = createFileRoute("/orders/$orderId")({
  component: OrderPage,
});

const STEPS: Order["status"][] = ["placed", "confirmed", "shipped", "delivered"];

function OrderPage() {
  const { orderId } = Route.useParams();
  const { user, isLoading: authLoading } = useAuth();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => api<{ order: Order }>(`/orders/${orderId}`).then((r) => r.order),
    enabled: !!user,
  });

  if (authLoading || isLoading) return <div className="pt-40 text-center text-charcoal/50">Loading…</div>;
  if (!user) {
    return (
      <div className="pt-40 text-center">
        <Link to="/login" search={{ redirect: `/orders/${orderId}` }} className="text-gold hover:underline">Log in to view this order</Link>
      </div>
    );
  }
  if (!order) return <div className="pt-40 text-center text-charcoal/60">Order not found.</div>;

  const refresh = (o: Order) => {
    qc.setQueryData(["order", orderId], o);
    qc.invalidateQueries({ queryKey: ["my-orders"] });
  };

  const retryPay = async () => {
    setBusy(true);
    try {
      const r = await api<{ order: Order; razorpay: any }>(`/orders/${order._id}/pay`, { method: "POST" });
      refresh(await payWithRazorpay(order._id, r.razorpay));
      toast.success("Payment successful!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    if (!confirm("Cancel this order?")) return;
    try {
      refresh((await api<{ order: Order }>(`/orders/${order._id}/cancel`, { method: "POST" })).order);
      toast.success("Order cancelled");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const stepIndex = STEPS.indexOf(order.status);
  const awaitingPay = order.paymentMethod === "razorpay" && order.paymentStatus !== "paid" && order.status !== "cancelled";

  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-6 text-charcoal">
      <Link to="/account" search={{ tab: "orders" }} className="text-sm text-charcoal/60 hover:text-gold">← My Orders</Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-gold/20 pb-6">
        <div>
          <h1 className="font-display text-4xl text-forest">Order {order.orderNumber}</h1>
          <p className="text-sm text-charcoal/60 mt-2">Placed on {new Date(order.createdAt).toLocaleString("en-IN")}</p>
        </div>
        <span className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase ${order.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-olive/10 text-olive"}`}>
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      {awaitingPay && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gold/40 bg-gold/10 p-5">
          <p className="text-sm">Payment is pending for this order.</p>
          <button disabled={busy} onClick={retryPay} className="bg-forest text-cream px-6 py-3 rounded-full text-xs font-semibold tracking-widest uppercase hover:bg-olive disabled:opacity-60">
            {busy ? "Opening…" : `Pay ${inr(order.total)} now`}
          </button>
        </div>
      )}

      {order.status !== "cancelled" && order.status !== "pending_payment" && (
        <div className="mt-10 grid grid-cols-4 gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-col items-center text-center gap-2">
              {i <= stepIndex ? <CheckCircle2 className="size-7 text-olive" /> : <Circle className="size-7 text-charcoal/20" />}
              <span className={`text-xs uppercase tracking-wider ${i <= stepIndex ? "text-olive" : "text-charcoal/40"}`}>{STATUS_LABEL[s]}</span>
            </div>
          ))}
        </div>
      )}
      {order.trackingNumber && (
        <p className="mt-6 text-sm">
          Tracking number: <b>{order.trackingNumber}</b>
        </p>
      )}

      <div className="mt-10 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {order.items.map((i) => (
            <div key={i.product} className="flex items-center gap-4 bg-cream rounded-2xl p-4">
              <img src={i.image} alt="" className="size-16 rounded-xl object-cover" />
              <div className="flex-1">
                <Link to="/product/$productId" params={{ productId: i.slug }} className="font-display text-lg text-forest hover:text-gold">{i.name}</Link>
                <p className="text-xs text-charcoal/60">{inr(i.price)} × {i.qty}</p>
              </div>
              <span className="font-medium">{inr(i.price * i.qty)}</span>
            </div>
          ))}
        </div>
        <div className="space-y-6 text-sm">
          <div className="bg-forest text-cream rounded-2xl p-6 space-y-2">
            <div className="flex justify-between"><span className="text-cream/70">Subtotal</span><span>{inr(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-cream/70">Shipping</span><span>{order.shipping ? inr(order.shipping) : "Free"}</span></div>
            <div className="flex justify-between text-lg font-medium pt-2 border-t border-gold/30"><span>Total</span><span className="text-gold">{inr(order.total)}</span></div>
            <p className="text-xs text-cream/60 pt-2">
              {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online (Razorpay)"} · Payment {order.paymentStatus}
            </p>
          </div>
          <div className="bg-cream rounded-2xl p-6">
            <h3 className="font-semibold mb-2">Shipping to</h3>
            <p className="text-charcoal/70 leading-relaxed">
              {order.address.fullName} · {order.address.phone}
              <br />
              {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ""}
              <br />
              {order.address.city}, {order.address.state} – {order.address.pincode}
            </p>
          </div>
          {["pending_payment", "placed", "confirmed"].includes(order.status) && (
            <button onClick={cancel} className="w-full border border-red-300 text-red-600 py-3 rounded-full text-xs font-semibold tracking-widest uppercase hover:bg-red-50">
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
