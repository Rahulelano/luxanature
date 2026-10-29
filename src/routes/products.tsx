import { createFileRoute, Link } from "@tanstack/react-router";
import { AllProducts } from "@/components/luxa/Products";
export const Route = createFileRoute("/products")({
  component: ProductsPage,
});

function ProductsPage() {
  return (
    <div className="pt-32 pb-24 text-charcoal max-w-5xl mx-auto px-6">
      <div className="text-center mb-16">
        <h1 className="font-display text-4xl text-forest tracking-widest uppercase">Our Products</h1>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Honey Section */}
        <div className="bg-sand p-8 rounded-2xl flex flex-col items-start gap-4">
          <h2 className="font-display text-2xl text-charcoal tracking-wide">1. HONEY PRODUCTS</h2>
          <p className="text-sm leading-relaxed text-charcoal/80 flex-1">
            Discover the natural goodness of honey with our carefully selected range of honey-based products.
          </p>
          <Link to="/honey-products" className="text-olive hover:text-gold uppercase tracking-widest text-xs font-semibold py-2">
            Explore Honey →
          </Link>
        </div>

        {/* Nutrition Section */}
        <div className="bg-sand p-8 rounded-2xl flex flex-col items-start gap-4">
          <h2 className="font-display text-2xl text-charcoal tracking-wide">2. NUTRITIONAL PRODUCTS</h2>
          <p className="text-sm leading-relaxed text-charcoal/80 flex-1">
            Our nutritional range is developed for people looking to make better choices for their everyday lifestyle.
          </p>
          <Link to="/nutritional-products" className="text-olive hover:text-gold uppercase tracking-widest text-xs font-semibold py-2">
            Explore Nutrition →
          </Link>
        </div>

        {/* Cosmetics Section */}
        <div className="bg-sand p-8 rounded-2xl flex flex-col items-start gap-4">
          <h2 className="font-display text-2xl text-charcoal tracking-wide">3. COSMETICS</h2>
          <p className="text-sm leading-relaxed text-charcoal/80 flex-1">
            Experience nature-inspired personal care with the Luxa Naturals cosmetics collection.
          </p>
          <Link to="/cosmetics" className="text-olive hover:text-gold uppercase tracking-widest text-xs font-semibold py-2">
            Explore Cosmetics →
          </Link>
        </div>
      </div>

      <div className="mt-32">
        <h2 className="font-display text-3xl mb-12 tracking-widest text-forest text-center uppercase">Complete Collection</h2>
        <AllProducts />
      </div>
      
      <div className="mt-32 max-w-3xl mx-auto bg-gradient-forest text-cream p-12 rounded-3xl text-center shadow-luxe">
        <h2 className="font-display text-3xl mb-8 tracking-widest text-gold text-center">WHY LUXA NATURALS?</h2>
        <div className="grid sm:grid-cols-2 gap-8 text-left">
          <div>
            <h4 className="text-lg font-semibold tracking-wide text-gold">Nature Inspired</h4>
            <p className="text-sm text-cream/70 mt-2">We draw inspiration from natural ingredients and traditional goodness while embracing modern product development.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold tracking-wide text-gold">Quality Focused</h4>
            <p className="text-sm text-cream/70 mt-2">Quality is considered at every stage — from ingredient selection to the finished product.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold tracking-wide text-gold">Modern & Convenient</h4>
            <p className="text-sm text-cream/70 mt-2">Our products are designed to fit naturally into today's busy lifestyles.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold tracking-wide text-gold">Customer First</h4>
            <p className="text-sm text-cream/70 mt-2">We continuously listen to our customers and work towards improving our products and services.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
