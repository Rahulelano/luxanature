import { createFileRoute } from "@tanstack/react-router";
import { Leaf, ShieldCheck, HeartHandshake } from "lucide-react";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="bg-background pt-32 pb-24">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 mb-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-eyebrow text-olive mb-4">Our Story</p>
            <h1 className="font-display text-5xl lg:text-6xl text-forest leading-tight mb-8">
              Good products begin with <span className="gold-text italic">good ingredients.</span>
            </h1>
            <div className="space-y-6 text-charcoal/80 leading-relaxed font-light">
              <p>
                Our journey is built around a simple philosophy: nature-inspired products, quality ingredients, and responsible choices. 
              </p>
              <p>
                We offer a growing range of products across Honey, Nutrition, and Cosmetics, created for customers who value quality, purity, and everyday wellness. Every single product we create reflects our deep respect for nature and traditional wisdom, refined for the modern lifestyle.
              </p>
            </div>
            <div className="hairline mt-10 w-32" />
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-forest rounded-3xl translate-x-4 translate-y-4 opacity-10"></div>
            <img 
              src={hero} 
              alt="Luxa Naturals Origin" 
              className="relative aspect-[4/5] object-cover rounded-3xl shadow-luxe w-full"
            />
            <div className="glass absolute -bottom-8 -left-8 p-6 max-w-xs">
              <p className="font-display text-lg text-foreground">Pure & Authentic</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Bringing the uncompromised goodness of nature closer to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="bg-gradient-forest text-cream py-28 relative overflow-hidden">
        <div className="absolute top-0 right-0 size-[500px] bg-gold/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 size-[500px] bg-olive/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="mx-auto max-w-4xl px-6 text-center relative z-10">
          <h2 className="font-display text-4xl sm:text-5xl mb-12">We are committed to</h2>
          
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="glass-dark p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-500">
              <Leaf className="size-8 text-gold mb-6" />
              <h3 className="font-display text-xl mb-3">Sourcing</h3>
              <p className="text-sm text-cream/70 leading-relaxed">Selecting quality ingredients and raw materials with a focus on natural origins.</p>
            </div>
            
            <div className="glass-dark p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-500">
              <ShieldCheck className="size-8 text-gold mb-6" />
              <h3 className="font-display text-xl mb-3">Quality</h3>
              <p className="text-sm text-cream/70 leading-relaxed">Developing products with strict adherence to consistency and high standards during production.</p>
            </div>
            
            <div className="glass-dark p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-500">
              <HeartHandshake className="size-8 text-gold mb-6" />
              <h3 className="font-display text-xl mb-3">Evolution</h3>
              <p className="text-sm text-cream/70 leading-relaxed">Continuously improving our product range based on customer needs and modern lifestyles.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer Text */}
      <div className="pt-24 pb-8 text-center px-6">
        <p className="text-2xl md:text-3xl font-display text-olive italic">Luxa Naturals — bringing the goodness of nature closer to you.</p>
      </div>
    </div>
  );
}
