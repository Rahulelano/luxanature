import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, type Category } from "@/lib/api";
import { useProducts } from "@/lib/store";
import { ProductGrid } from "@/components/luxa/Products";

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const [sub, setSub] = useState<string>("");
  const [sort, setSort] = useState("new");

  const { data: category, isLoading, isError } = useQuery({
    queryKey: ["category", slug],
    queryFn: () => api<{ category: Category }>(`/categories/${slug}`).then((r) => r.category),
  });
  const { data: products = [], isLoading: loadingProducts } = useProducts({ category: slug, sub: sub || undefined, sort });

  if (isLoading) return <div className="pt-40 pb-24 text-center text-charcoal/50">Loading…</div>;
  if (isError || !category) {
    return (
      <div className="pt-40 pb-24 text-center">
        <h1 className="font-display text-4xl text-forest mb-4">Category not found</h1>
        <Link to="/products" className="text-gold hover:underline">View all products</Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 text-charcoal max-w-6xl mx-auto px-6">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl text-forest mb-6 tracking-widest uppercase">{category.name}</h1>
        {category.description && <p className="max-w-2xl mx-auto text-charcoal/70">{category.description}</p>}
      </div>

      {(category.children?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <button
            onClick={() => setSub("")}
            className={`px-5 py-2 rounded-full border text-sm tracking-wide transition-colors ${!sub ? "bg-forest text-cream border-forest" : "border-gold/30 bg-sand hover:border-olive"}`}
          >
            All
          </button>
          {category.children!.map((c) => (
            <button
              key={c._id}
              onClick={() => setSub(c.slug)}
              className={`px-5 py-2 rounded-full border text-sm tracking-wide transition-colors ${sub === c.slug ? "bg-forest text-cream border-forest" : "border-gold/30 bg-sand hover:border-olive"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-gold/30 bg-cream rounded-full px-4 py-2 text-xs tracking-wider"
          aria-label="Sort products"
        >
          <option value="new">Newest</option>
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
          <option value="name">Name</option>
        </select>
      </div>

      <ProductGrid products={products} loading={loadingProducts} />
    </div>
  );
}
