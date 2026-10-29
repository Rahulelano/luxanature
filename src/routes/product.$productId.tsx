import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, Minus, Plus } from "lucide-react";
import { api, inr, type Product } from "@/lib/api";
import { useCart, useWishlist } from "@/lib/store";
import { ProductCard } from "@/components/luxa/Products";

export const Route = createFileRoute("/product/$productId")({
  component: ProductDetailsPage,
});

function ProductDetailsPage() {
  const { productId } = Route.useParams();
  const { add } = useCart();
  const wishlist = useWishlist();
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => api<{ product: Product; related: Product[] }>(`/products/${productId}`),
  });

  if (isLoading) return <div className="pt-40 pb-24 text-center text-charcoal/50">Loading…</div>;

  const product = data?.product;
  if (isError || !product) {
    return (
      <div className="pt-32 pb-24 max-w-6xl mx-auto px-6 text-center">
        <h1 className="font-display text-4xl text-forest mb-4">Product Not Found</h1>
        <Link to="/products" className="text-gold hover:underline">
          Return to All Products
        </Link>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;

  return (
    <div className="pt-32 pb-24 max-w-6xl mx-auto px-6">
      <div className="mb-8">
        <Link to="/category/$slug" params={{ slug: product.category.slug }} className="text-sm text-charcoal/60 hover:text-gold transition-colors">
          ← Back to {product.category.name}
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        <div>
          <div className="bg-cream rounded-3xl aspect-[4/5] flex items-center justify-center relative overflow-hidden group">
            <img
              src={product.images[active] || product.images[0]}
              alt={product.name}
              className="size-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActive(i)}
                  className={`size-20 shrink-0 overflow-hidden rounded-xl border-2 ${i === active ? "border-gold" : "border-transparent"}`}
                >
                  <img src={img} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="text-xs font-semibold tracking-widest text-olive uppercase bg-olive/10 px-3 py-1 rounded-full">
              {product.subcategory?.name || product.category.name}
            </span>
            {product.tag && (
              <span className="text-xs font-semibold tracking-widest text-gold uppercase bg-gold/10 px-3 py-1 rounded-full">{product.tag}</span>
            )}
          </div>

          <h1 className="font-display text-4xl lg:text-5xl text-forest mb-4 leading-tight">{product.name}</h1>

          <div className="flex items-center gap-4 mb-2">
            <p className="text-2xl text-charcoal font-medium">{inr(product.price)}</p>
            {product.mrp > product.price && <p className="text-lg text-muted-foreground line-through">{inr(product.mrp)}</p>}
          </div>
          <p className={`text-xs mb-8 ${outOfStock ? "text-red-600" : "text-olive"}`}>
            {outOfStock ? "Out of stock" : product.stock <= 5 ? `Only ${product.stock} left` : "In stock"}
          </p>

          {product.description && <p className="text-charcoal/80 leading-relaxed mb-8 whitespace-pre-line">{product.description}</p>}

          <div className="space-y-6 mb-10 border-t border-b border-gold/20 py-6">
            {product.ingredients && (
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wide text-charcoal mb-2">Key Ingredients</h4>
                <p className="text-sm text-charcoal/70 whitespace-pre-line">{product.ingredients}</p>
              </div>
            )}
            {product.benefits && (
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wide text-charcoal mb-2">Benefits</h4>
                <p className="text-sm text-charcoal/70 whitespace-pre-line">{product.benefits}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center border border-gold/40 rounded-full px-2 py-2">
              <button aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-2 text-charcoal/60 hover:text-gold">
                <Minus className="size-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium">{qty}</span>
              <button aria-label="Increase" onClick={() => setQty((q) => Math.min(product.stock || 1, q + 1))} className="px-2 text-charcoal/60 hover:text-gold">
                <Plus className="size-4" />
              </button>
            </div>
            <button
              disabled={outOfStock}
              onClick={() => add(product, qty)}
              className="bg-gradient-forest text-cream px-10 py-4 text-sm font-semibold tracking-widest uppercase rounded-full hover:shadow-xl hover:shadow-olive/20 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {outOfStock ? "Out of Stock" : "Add to Bag"}
            </button>
            <button
              aria-label="Wishlist"
              onClick={() => wishlist.toggle(product)}
              className={`grid size-12 place-items-center rounded-full border border-gold/40 ${wishlist.has(product._id) ? "text-red-500" : "text-charcoal/60 hover:text-olive"}`}
            >
              <Heart className={`size-5 ${wishlist.has(product._id) ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {data.related.length > 0 && (
        <div className="mt-24">
          <h2 className="font-display text-3xl text-forest mb-10 text-center">You may also like</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {data.related.map((p) => (
              <ProductCard key={p._id} p={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
