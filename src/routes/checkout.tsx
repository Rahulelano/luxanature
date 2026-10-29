import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { api, inr, shippingFor, type Address, type Order, type User } from "@/lib/api";
import { useAuth, useCart, useSettings } from "@/lib/store";
import { payWithRazorpay } from "@/lib/razorpay";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

const EMPTY: Address = { fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" };
const input =
  "w-full bg-cream/50 border border-gold/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-olive focus:bg-cream transition-colors placeholder:text-charcoal/40";

function CheckoutPage() {
  const { user, isLoading, setUser } = useAuth();
  const { items, subtotal, clear } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [selected, setSelected] = useState<string>("new");
  const [addr, setAddr] = useState<Address>(EMPTY);
  const [saveAddr, setSaveAddr] = useState(true);
  const [method, setMethod] = useState<"razorpay" | "cod">("razorpay");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const def = user?.addresses.find((a) => a.isDefault) || user?.addresses[0];
    if (def?._id) setSelected(def._id);
    if (user && !addr.fullName) setAddr((a) => ({ ...a, fullName: user.name, phone: user.phone }));
  }, [user]);

  useEffect(() => {
    if (!settings.razorpayEnabled && settings.codEnabled) setMethod("cod");
    if (settings.razorpayEnabled && !settings.codEnabled) setMethod("razorpay");
  }, [settings.razorpayEnabled, settings.codEnabled]);

  const shipping = shippingFor(subtotal, settings.shippingFee, settings.freeShippingAbove);
  const total = subtotal + shipping;

  if (isLoading) return <div className="pt-40 text-center text-charcoal/50">Loading…</div>;

  if (!user) {
    return (
      <div className="pt-40 pb-24 max-w-md mx-auto px-6 text-center">
        <h1 className="font-display text-3xl text-forest mb-4">Log in to checkout</h1>
        <p className="text-sm text-charcoal/60 mb-8">We'll email you a one-time code — no password needed.</p>
        <Link to="/login" search={{ redirect: "/checkout" }} className="bg-forest text-cream px-8 py-4 rounded-full font-semibold uppercase tracking-widest text-xs hover:bg-olive">
          Login with Email OTP
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-40 pb-24 text-center">
        <p className="text-charcoal/60 mb-6">Your cart is empty.</p>
        <Link to="/products" className="text-gold hover:underline">Continue shopping</Link>
      </div>
    );
  }

  const placeOrder = async () => {
    const address = selected === "new" ? addr : user.addresses.find((a) => a._id === selected);
    if (!address) {
      toast.error("Choose an address");
      return;
    }
    for (const f of ["fullName", "phone", "line1", "city", "state", "pincode"] as const) {
      if (!address[f]) {
        toast.error("Please fill in all required address fields");
        return;
      }
    }
    setBusy(true);
    try {
      if (selected === "new" && saveAddr) {
        const r = await api<{ user: User }>("/auth/addresses", { body: address });
        setUser(r.user);
      }
      const r = await api<{ order: Order; razorpay?: any }>("/orders", {
        body: { items: items.map((i) => ({ productId: i.productId, qty: i.qty })), address, paymentMethod: method },
      });

      if (method === "cod") {
        clear();
        toast.success("Order placed!");
        navigate({ to: "/orders/$orderId", params: { orderId: r.order._id } });
        return;
      }

      try {
        await payWithRazorpay(r.order._id, r.razorpay);
        clear();
        toast.success("Payment successful — order placed!");
      } catch (e: any) {
        toast.error(`${e.message}. You can retry payment from your order page.`);
      }
      navigate({ to: "/orders/$orderId", params: { orderId: r.order._id } });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const field = (k: keyof Address, placeholder: string, type = "text") => (
    <input type={type} placeholder={placeholder} value={(addr[k] as string) || ""} onChange={(e) => setAddr({ ...addr, [k]: e.target.value })} className={input} />
  );

  return (
    <div className="pt-32 pb-24 max-w-6xl mx-auto px-6">
      <div className="mb-8">
        <Link to="/cart" className="text-sm text-charcoal/60 hover:text-gold transition-colors">
          ← Back to Cart
        </Link>
      </div>

      <h1 className="font-display text-4xl lg:text-5xl text-forest mb-12 border-b border-gold/20 pb-6">Secure Checkout</h1>

      <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
        <div className="lg:col-span-7 space-y-12">
          <section>
            <h2 className="font-display text-2xl text-charcoal mb-6 border-b border-olive/10 pb-2">1. Contact</h2>
            <p className="text-sm text-charcoal/70">
              Logged in as <b>{user.email}</b>
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-charcoal mb-6 border-b border-olive/10 pb-2">2. Shipping Address</h2>
            <div className="space-y-3 mb-4">
              {user.addresses.map((a) => (
                <label key={a._id} className={`flex gap-3 p-4 border rounded-xl cursor-pointer text-sm ${selected === a._id ? "border-olive bg-olive/5" : "border-gold/30"}`}>
                  <input type="radio" name="addr" checked={selected === a._id} onChange={() => setSelected(a._id!)} />
                  <span>
                    <b>{a.fullName}</b> · {a.phone}
                    <br />
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} – {a.pincode}
                  </span>
                </label>
              ))}
              {user.addresses.length > 0 && (
                <label className={`flex gap-3 p-4 border rounded-xl cursor-pointer text-sm ${selected === "new" ? "border-olive bg-olive/5" : "border-gold/30"}`}>
                  <input type="radio" name="addr" checked={selected === "new"} onChange={() => setSelected("new")} /> Use a new address
                </label>
              )}
            </div>

            {selected === "new" && (
              <div className="space-y-4 text-charcoal">
                <div className="grid grid-cols-2 gap-4">
                  {field("fullName", "Full Name *")}
                  {field("phone", "Phone Number *", "tel")}
                </div>
                {field("line1", "Address line 1 *")}
                {field("line2", "Apartment, suite, etc. (optional)")}
                <div className="grid grid-cols-3 gap-4">
                  {field("city", "City *")}
                  {field("state", "State *")}
                  {field("pincode", "PIN Code *")}
                </div>
                <label className="flex items-center gap-2 text-xs text-charcoal/70">
                  <input type="checkbox" checked={saveAddr} onChange={(e) => setSaveAddr(e.target.checked)} /> Save this address to my account
                </label>
              </div>
            )}
          </section>

          <section>
            <h2 className="font-display text-2xl text-charcoal mb-6 border-b border-olive/10 pb-2">3. Payment Method</h2>
            <div className="space-y-4">
              {settings.razorpayEnabled && (
                <label className={`flex items-center gap-4 p-5 border rounded-xl cursor-pointer transition-colors ${method === "razorpay" ? "border-olive bg-olive/5" : "border-gold/30"}`}>
                  <input type="radio" name="payment" checked={method === "razorpay"} onChange={() => setMethod("razorpay")} className="w-4 h-4" />
                  <div className="flex flex-col">
                    <span className="font-medium text-charcoal text-sm">Pay Online — UPI / Cards / Netbanking</span>
                    <span className="text-xs text-charcoal/50 mt-1">Secure payment via Razorpay</span>
                  </div>
                </label>
              )}
              {settings.codEnabled && (
                <label className={`flex items-center gap-4 p-5 border rounded-xl cursor-pointer transition-colors ${method === "cod" ? "border-olive bg-olive/5" : "border-gold/30"}`}>
                  <input type="radio" name="payment" checked={method === "cod"} onChange={() => setMethod("cod")} className="w-4 h-4" />
                  <div className="flex flex-col">
                    <span className="font-medium text-charcoal text-sm">Cash on Delivery</span>
                    <span className="text-xs text-charcoal/50 mt-1">Pay when you receive your order</span>
                  </div>
                </label>
              )}
              {!settings.razorpayEnabled && !settings.codEnabled && (
                <p className="text-sm text-red-600">Payments are currently unavailable. Please contact us.</p>
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-forest text-cream p-8 rounded-3xl h-fit sticky top-32 shadow-2xl shadow-forest/20">
            <h2 className="font-display text-2xl mb-8 border-b border-gold/20 pb-4">Order Summary</h2>

            <div className="space-y-4 mb-8">
              {items.map((i) => (
                <div key={i.productId} className="flex items-center gap-4">
                  <img src={i.image} alt="" className="size-14 rounded-lg object-cover" />
                  <div className="flex-1 text-sm">
                    <p>{i.name}</p>
                    <p className="text-cream/60 text-xs">Qty {i.qty}</p>
                  </div>
                  <span className="text-sm">{inr(i.price * i.qty)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 text-sm font-light">
              <div className="flex justify-between">
                <span className="text-cream/70">Subtotal</span>
                <span>{inr(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cream/70">Shipping</span>
                <span>{shipping === 0 ? "Free" : inr(shipping)}</span>
              </div>
              <div className="h-px w-full bg-gold/30 my-6" />
              <div className="flex justify-between font-medium text-xl items-center">
                <span>Total</span>
                <span className="text-gold text-2xl tracking-wide">{inr(total)}</span>
              </div>
            </div>

            <button
              disabled={busy || (!settings.razorpayEnabled && !settings.codEnabled)}
              onClick={placeOrder}
              className="block w-full text-center bg-gradient-gold text-charcoal font-bold uppercase tracking-widest text-xs py-4 rounded-full mt-10 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 disabled:opacity-60"
            >
              {busy ? "Processing…" : method === "cod" ? "Place Order" : `Pay ${inr(total)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
