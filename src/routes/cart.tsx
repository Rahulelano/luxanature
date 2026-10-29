import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { inr, shippingFor } from "@/lib/api";
import { useCart, useSettings } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, setQty, remove } = useCart();
  const { settings } = useSettings();
  const shipping = shippingFor(subtotal, settings.shippingFee, settings.freeShippingAbove);

  return (
    <div className="pt-32 pb-24 max-w-6xl mx-auto px-6 min-h-[85vh]">
      <h1 className="font-display text-4xl lg:text-5xl text-forest mb-12 text-center">Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-cream rounded-3xl">
          <p className="text-charcoal/60 mb-6 font-medium tracking-wider uppercase text-sm">Your cart is empty</p>
          <Link to="/products" className="bg-forest text-cream px-8 py-4 rounded-full font-semibold uppercase tracking-widest text-xs hover:bg-olive transition-all duration-300">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-12 text-charcoal">
          <div className="lg:col-span-2 space-y-6">
            <div className="hidden sm:grid grid-cols-12 gap-4 pb-4 border-b border-gold/30 text-xs font-semibold tracking-widest uppercase text-charcoal/60">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            {items.map((item) => (
              <div key={item.productId} className="flex flex-col sm:grid sm:grid-cols-12 gap-4 sm:gap-6 items-center bg-cream sm:bg-transparent p-4 sm:p-0 rounded-2xl sm:rounded-none relative sm:py-6 sm:border-b sm:border-gold/10">
                <div className="col-span-6 flex gap-4 w-full">
                  <img src={item.image} alt={item.name} className="w-24 h-32 object-cover rounded-xl" />
                  <div className="flex-1 flex flex-col justify-center">
                    <Link to="/product/$productId" params={{ productId: item.slug }}>
                      <h3 className="font-display text-xl text-forest mb-2 hover:text-gold">{item.name}</h3>
                    </Link>
                    <p className="text-sm text-charcoal/70">{inr(item.price)}</p>
                    <button onClick={() => remove(item.productId)} className="text-left py-2 sm:hidden text-xs text-charcoal/40 hover:text-destructive transition-colors flex items-center gap-1 mt-2">
                      <Trash2 className="size-3" /> Remove
                    </button>
                  </div>
                </div>

                <div className="col-span-3 flex justify-between sm:justify-center items-center w-full sm:w-auto">
                  <span className="text-xs uppercase tracking-widest text-charcoal/50 sm:hidden">Quantity</span>
                  <div className="flex items-center border border-gold/40 rounded-full px-2 py-1">
                    <button onClick={() => setQty(item.productId, item.qty - 1)} className="text-charcoal/50 hover:text-gold px-2 py-1 transition-colors">-</button>
                    <span className="text-sm font-medium w-8 text-center">{item.qty}</span>
                    <button onClick={() => setQty(item.productId, item.qty + 1)} className="text-charcoal/50 hover:text-gold px-2 py-1 transition-colors">+</button>
                  </div>
                </div>

                <div className="col-span-3 flex justify-between sm:justify-end items-center w-full sm:w-auto">
                  <span className="text-xs uppercase tracking-widest text-charcoal/50 sm:hidden">Total</span>
                  <span className="font-medium text-lg">{inr(item.price * item.qty)}</span>
                </div>

                <button onClick={() => remove(item.productId)} className="hidden sm:block absolute top-6 right-0 text-charcoal/30 hover:text-destructive transition-colors" title="Remove Item">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-forest text-cream p-8 rounded-3xl h-fit sticky top-32 shadow-xl shadow-forest/10">
            <h2 className="font-display text-2xl mb-8 border-b border-gold/20 pb-4">Order Summary</h2>
            <div className="space-y-4 text-sm mb-8 font-light">
              <div className="flex justify-between">
                <span className="text-cream/70">Subtotal</span>
                <span className="font-medium">{inr(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cream/70">Shipping</span>
                <span className="font-medium">{shipping === 0 ? "Free" : inr(shipping)}</span>
              </div>
              {settings.freeShippingAbove > 0 && subtotal < settings.freeShippingAbove && (
                <p className="text-xs text-gold">Add {inr(settings.freeShippingAbove - subtotal)} more for free shipping</p>
              )}
              <div className="h-px w-full bg-gold/30 my-6" />
              <div className="flex justify-between font-medium text-xl">
                <span>Total</span>
                <span className="text-gold tracking-wide">{inr(subtotal + shipping)}</span>
              </div>
            </div>

            <Link to="/checkout" className="block w-full text-center bg-gradient-gold text-charcoal font-semibold uppercase tracking-widest text-xs py-4 rounded-full hover:shadow-lg transition-all duration-300">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
