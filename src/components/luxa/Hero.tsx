import heroImg from "@/assets/hero.jpg";
import { Logo } from "./Chrome";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useSettings } from "@/lib/store";

function Leaf({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 40 40" className={className} style={style} fill="currentColor" aria-hidden>
      <path d="M36 4C18 6 6 14 5 28c-.3 4 1 7 3 8 3-11 11-18 21-21-7 4-12 9-15 16 12 1 21-8 22-27Z" />
    </svg>
  );
}

export function Hero() {
  const { settings, t } = useSettings();
  return (
    <section id="top" className="relative min-h-screen overflow-hidden bg-charcoal">
      <img
        src={settings.heroImage || heroImg}
        alt="Luxa Naturals wild honey jar surrounded by olive branches in golden forest light"
        width={1920}
        height={1200}
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.2_0.02_140/0.82),oklch(0.2_0.02_140/0.45)_45%,oklch(0.19_0.02_140/0.9))]" />

      {/* floating honey drops */}
      {[18, 34, 62, 79, 91].map((left, i) => (
        <span
          key={left}
          className="absolute top-0 h-10 w-[6px] rounded-full bg-gradient-gold opacity-70 blur-[1px]"
          style={{ left: `${left}%`, animation: `drip ${6 + i}s ${i * 1.6}s ease-in infinite` }}
        />
      ))}

      {/* botanical leaves */}
      <Leaf className="absolute top-[22%] left-[8%] size-16 text-olive/50 animate-sway" />
      <Leaf className="absolute top-[62%] left-[16%] size-10 text-gold/35 animate-float-mid" />
      <Leaf className="absolute top-[30%] right-[10%] size-20 text-olive/40 animate-float-slow" />
      <Leaf className="absolute bottom-[16%] right-[22%] size-12 text-gold/30 animate-sway" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 pt-28 pb-20 text-center">
        <div className="animate-float-mid">
          <div className="[&_span.text-charcoal]:text-cream scale-125">
            <Logo tone="dark" />
          </div>
        </div>

        <p className="text-eyebrow mt-12 text-gold">{t("hero.eyebrow", "Luxury Wellness, Sourced From Nature")}</p>

        <h1 className="mt-6 font-display text-5xl leading-[1.05] text-cream sm:text-6xl lg:text-7xl">
          {t("hero.title1", "Nature. Quality.")}
          <span className="block gold-text italic">{t("hero.title2", "Everyday Wellness.")}</span>
        </h1>

        <p className="mt-8 max-w-xl text-sm leading-relaxed text-cream/70 sm:text-base">
          {t("hero.subtitle", "Raw wild honey, botanical nutrition and cold-pressed skincare — crafted in small batches from single-origin groves, for a ritual you can feel every single day.")}
        </p>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <Link
            to="/products"
            className="group inline-flex items-center justify-center gap-3 bg-gradient-gold px-10 py-4 text-xs tracking-[0.24em] text-charcoal uppercase shadow-gold transition-all duration-500 hover:-translate-y-1"
          >
            {t("hero.cta1", "Shop Now")}
            <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
          <Link
            to="/products"
            className="glass-dark inline-flex items-center justify-center px-10 py-4 text-xs tracking-[0.24em] text-cream uppercase transition-all duration-500 hover:-translate-y-1 hover:text-gold"
          >
            {t("hero.cta2", "Explore Products")}
          </Link>
        </div>

        <div className="glass-dark mt-16 grid w-full max-w-2xl grid-cols-3 divide-x divide-cream/10 rounded-sm">
          {[
            ["100%", "Natural Origin"],
            ["Small", "Batch Crafted"],
            ["Lab", "Purity Tested"],
          ].map(([a, b]) => (
            <div key={b} className="px-4 py-6">
              <p className="font-display text-2xl text-gold">{a}</p>
              <p className="mt-1 text-[0.65rem] tracking-[0.2em] text-cream/60 uppercase">{b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
