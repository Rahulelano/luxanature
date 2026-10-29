import { useEffect, useState } from "react";
import { Heart, Eye, ShoppingBag, Star, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { inr, type Product } from "@/lib/api";
import { useCart, useCategories, useProducts, useSettings, useWishlist } from "@/lib/store";

export type { Product };

function Rating({ value, reviews }: { value: number; reviews: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5 text-gold">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`size-3 ${i < Math.round(value) ? "fill-current" : "opacity-30"}`} />
        ))}
      </div>
      {reviews > 0 && <span className="text-[0.65rem] tracking-wider text-muted-foreground">({reviews})</span>}
    </div>
  );
}

export function ProductCard({ p }: { p: Product }) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { add } = useCart();
  const wishlist = useWishlist();
  const isWishlisted = wishlist.has(p._id);
  const outOfStock = p.stock <= 0;

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      <article className="group relative overflow-hidden bg-card shadow-luxe/0 transition-all duration-700 hover:shadow-luxe rounded-2xl">
        <div className="relative aspect-[4/5] overflow-hidden bg-cream">
          <Link to="/product/$productId" params={{ productId: p.slug }}>
            <img
              src={p.images[0]}
              alt={p.name}
              loading="lazy"
              width={1024}
              height={1280}
              className="size-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
            />
          </Link>
          {(p.tag || outOfStock) && (
            <span className="absolute top-4 left-4 bg-gradient-gold px-3 py-1 text-[0.6rem] tracking-[0.22em] text-charcoal uppercase pointer-events-none z-10 font-semibold rounded-sm">
              {outOfStock ? "Sold Out" : p.tag}
            </span>
          )}
          <div className="absolute top-4 right-4 flex translate-x-14 flex-col gap-2 transition-transform duration-500 group-hover:translate-x-0 z-10">
            <button
              onClick={(e) => {
                stop(e);
                wishlist.toggle(p);
              }}
              aria-label="Add to wishlist"
              title="Add to wishlist"
              className={`glass grid size-9 place-items-center rounded-full transition-colors ${
                isWishlisted ? "text-red-500 bg-cream/90" : "text-charcoal/75 hover:text-olive"
              }`}
            >
              <Heart className={`size-4 ${isWishlisted ? "fill-current" : ""}`} />
            </button>

            <button
              onClick={(e) => {
                stop(e);
                setQuickViewOpen(true);
              }}
              aria-label="Quick view"
              title="Quick view"
              className="glass grid size-9 place-items-center rounded-full text-charcoal/75 transition-colors hover:text-olive"
            >
              <Eye className="size-4" />
            </button>
          </div>
          <button
            disabled={outOfStock}
            onClick={(e) => {
              stop(e);
              add(p);
            }}
            className="absolute inset-x-4 bottom-4 flex translate-y-16 items-center justify-center gap-2 bg-charcoal/90 py-3 text-[0.65rem] tracking-[0.24em] text-cream uppercase transition-all duration-500 group-hover:translate-y-0 hover:bg-olive disabled:opacity-60 z-10 rounded-lg"
          >
            <ShoppingBag className="size-4" /> {outOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>

        <div className="p-6 text-center z-10 relative">
          <p className="text-[0.6rem] tracking-[0.3em] text-olive uppercase font-medium">{p.subcategory?.name || p.category?.name}</p>
          <Link to="/product/$productId" params={{ productId: p.slug }}>
            <h3 className="mt-3 font-display text-lg text-foreground hover:text-gold transition-colors">{p.name}</h3>
          </Link>
          <div className="mt-3 flex justify-center">
            <Rating value={p.rating} reviews={p.reviewsCount} />
          </div>
          <p className="mt-4 flex items-center justify-center gap-2 text-sm">
            <span className="font-medium text-foreground">{inr(p.price)}</span>
            {p.mrp > p.price && <span className="text-xs text-muted-foreground line-through">{inr(p.mrp)}</span>}
          </p>
        </div>
      </article>

      {/* Quick View Modal */}
      {quickViewOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setQuickViewOpen(false)}
        >
          <div
            className="relative bg-card text-foreground max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl border border-gold/30 p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setQuickViewOpen(false)}
              className="absolute top-4 right-4 z-20 text-charcoal/60 hover:text-charcoal bg-cream/80 p-2 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="size-5" />
            </button>

            <div className="sm:w-1/2 aspect-[4/5] bg-cream rounded-2xl overflow-hidden relative">
              <img src={p.images[0]} alt={p.name} className="size-full object-cover" />
            </div>

            <div className="sm:w-1/2 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold tracking-widest text-olive uppercase">{p.category?.name}</span>
                <h3 className="font-display text-2xl text-forest mt-1 mb-2">{p.name}</h3>
                <div className="mb-4">
                  <Rating value={p.rating} reviews={p.reviewsCount} />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-bold text-charcoal">{inr(p.price)}</span>
                  {p.mrp > p.price && <span className="text-sm text-muted-foreground line-through">{inr(p.mrp)}</span>}
                </div>
                <p className="text-xs text-charcoal/80 leading-relaxed mb-6 line-clamp-5">{p.description}</p>
              </div>

              <div className="space-y-3">
                <button
                  disabled={outOfStock}
                  onClick={() => {
                    add(p);
                    setQuickViewOpen(false);
                  }}
                  className="w-full bg-forest text-cream py-3 rounded-full text-xs font-semibold tracking-widest uppercase hover:bg-olive transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <ShoppingBag className="size-4" /> {outOfStock ? "Out of Stock" : "Add to Cart"}
                </button>
                <Link
                  to="/product/$productId"
                  params={{ productId: p.slug }}
                  onClick={() => setQuickViewOpen(false)}
                  className="block w-full text-center border border-gold/40 text-charcoal py-3 rounded-full text-xs font-semibold tracking-widest uppercase hover:bg-cream transition-colors"
                >
                  View Full Details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function ProductGrid({ products, loading }: { products: Product[]; loading?: boolean }) {
  if (loading) return <p className="text-center text-charcoal/50 mt-12">Loading products…</p>;
  if (products.length === 0) return <p className="text-center text-charcoal/50 mt-12">No products found yet.</p>;
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-12">
      {products.map((p) => (
        <ProductCard key={p._id} p={p} />
      ))}
    </div>
  );
}

export function FeaturedProducts() {
  const { t } = useSettings();
  const { data: products = [] } = useProducts({ featured: "1", limit: "8" });
  if (products.length === 0) return null;
  return (
    <section id="featured" className="bg-gradient-cream py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-eyebrow text-olive">{t("featured.eyebrow", "Featured Collection")}</p>
          <h2 className="mt-5 font-display text-4xl sm:text-5xl">{t("featured.title", "Crafted in small batches")}</h2>
          <div className="hairline mx-auto mt-7 w-40" />
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p._id} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function BestSellers() {
  const { t } = useSettings();
  const { data: best = [] } = useProducts({ bestSeller: "1", limit: "12" });
  const [index, setIndex] = useState(0);
  const perView = 3;
  const max = Math.max(0, best.length - perView);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i >= max ? 0 : i + 1)), 4200);
    return () => window.clearInterval(id);
  }, [max]);

  if (best.length === 0) return null;

  return (
    <section id="bestsellers" className="bg-charcoal py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-eyebrow text-gold">{t("best.eyebrow", "Loved By Thousands")}</p>
            <h2 className="mt-5 font-display text-4xl text-cream sm:text-5xl">{t("best.title", "Best Sellers")}</h2>
          </div>
          <div className="flex gap-3">
            <button
              aria-label="Previous"
              onClick={() => setIndex((i) => (i <= 0 ? max : i - 1))}
              className="glass-dark grid size-12 place-items-center rounded-full text-cream/80 transition-colors hover:text-gold"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              aria-label="Next"
              onClick={() => setIndex((i) => (i >= max ? 0 : i + 1))}
              className="glass-dark grid size-12 place-items-center rounded-full text-cream/80 transition-colors hover:text-gold"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div className="mt-14 overflow-hidden">
          <div
            className="flex gap-8 transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(calc(${-index} * (100% / ${perView} + 2rem / ${perView} * ${perView - 1})))` }}
          >
            {best.map((p) => (
              <div key={p._id} className="w-full shrink-0 sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.34rem)]">
                <ProductCard p={p} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function AllProducts() {
  const { data: categories = [] } = useCategories();
  const { data: products = [], isLoading } = useProducts();
  if (isLoading) return <p className="text-center text-charcoal/50">Loading products…</p>;

  return (
    <div className="flex flex-col gap-24">
      {categories.map((category) => {
        const categoryProducts = products.filter((p) => p.category?._id === category._id);
        if (categoryProducts.length === 0) return null;
        return (
          <div key={category._id} className="space-y-8">
            <h3 className="font-display text-2xl text-forest uppercase tracking-widest border-b border-sand pb-4">{category.name}</h3>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {categoryProducts.map((p) => (
                <ProductCard key={p._id} p={p} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
