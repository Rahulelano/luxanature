import { useEffect, useRef, useState } from "react";
import { Leaf, ShieldCheck, Sparkles, HeartHandshake, PackagePlus, ArrowUpRight, Quote } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import honey from "@/assets/cat-honey.jpg";
import nutrition from "@/assets/cat-nutrition.jpg";
import cosmetics from "@/assets/cat-cosmetics.jpg";
import hero from "@/assets/hero.jpg";
import { useCategories, useSettings } from "@/lib/store";

/* ---------------------------------- Story --------------------------------- */

function Counter({ to, suffix }: { to: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / 1600, 1);
          setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);

  return (
    <span ref={ref} className="font-display text-4xl text-olive">
      {value.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export function BrandStory() {
  const { t } = useSettings();
  return (
    <section id="story" className="bg-background py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">
        <div className="relative" data-reveal>
          <img
            src={hero}
            alt="Golden honey drizzling over a jar in a sunlit forest grove"
            loading="lazy"
            width={1920}
            height={1200}
            className="aspect-[4/5] w-full object-cover shadow-luxe"
          />
          <div className="glass absolute -right-4 bottom-8 max-w-[210px] p-6 lg:-right-10">
            <p className="font-display text-lg text-foreground">Single-origin groves</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Harvested by hand from the Western Ghats, never blended, never heated.
            </p>
          </div>
        </div>

        <div data-reveal data-reveal-delay={140}>
          <p className="text-eyebrow text-olive">{t("story.eyebrow", "Our Story")}</p>
          <h2 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">
            {t("story.title", "A quiet obsession with")} <span className="gold-text italic">{t("story.titleAccent", "purity")}</span>
          </h2>
          <div className="hairline my-8 w-32" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("story.p1", "Luxa Naturals began with a single hive and a simple belief: wellness should taste, feel and smell exactly like the place it came from. We work directly with beekeepers, herb growers and cold-press artisans — no fillers, no shortcuts, no compromise.")}
          </p>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            {t("story.p2", "Every jar, capsule and serum is traceable to its grove and tested for purity before it earns our gold seal.")}
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-10">
            {[
              { to: 42, suffix: "+", label: "Partner Farms" },
              { to: 18000, suffix: "+", label: "Happy Rituals" },
              { to: 100, suffix: "%", label: "Natural Origin" },
            ].map((s) => (
              <div key={s.label}>
                <Counter to={s.to} suffix={s.suffix} />
                <p className="mt-2 text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Categories ------------------------------- */

const FALLBACK_IMG = [honey, nutrition, cosmetics];

export function Categories() {
  const { t } = useSettings();
  const { data: cats = [] } = useCategories();
  return (
    <section id="categories" className="bg-cream py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <p className="text-eyebrow text-olive">{t("categories.eyebrow", "Collections")}</p>
          <h2 className="mt-5 font-display text-4xl sm:text-5xl">{t("categories.title", "Three rituals, one standard")}</h2>
          <div className="hairline mx-auto mt-7 w-40" />
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {cats.map((c, i) => (
            <Link
              key={c._id}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="card-3d group relative block overflow-hidden bg-card"
              data-reveal
              data-reveal-delay={i * 130}
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={c.image || FALLBACK_IMG[i % 3]}
                  alt={c.name}
                  loading="lazy"
                  width={1024}
                  height={1280}
                  className="size-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,oklch(0.2_0.02_140/0.88))] p-8">
                <h3 className="font-display text-2xl text-cream">{c.name}</h3>
                <p className="mt-3 max-w-xs text-xs leading-relaxed text-cream/70 line-clamp-2">{c.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-[0.65rem] tracking-[0.24em] text-gold uppercase">
                  Shop Collection
                  <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------- Why ---------------------------------- */

const PILLARS = [
  { icon: Leaf, title: "Nature Inspired", copy: "Formulas led by botanicals, never by chemistry shortcuts." },
  { icon: ShieldCheck, title: "Quality Focused", copy: "Batch-tested for purity, potency and traceable origin." },
  { icon: Sparkles, title: "Modern & Convenient", copy: "Designed for daily rituals that fit real life." },
  { icon: HeartHandshake, title: "Customer First", copy: "Human support, easy returns, honest guidance." },
  { icon: PackagePlus, title: "Growing Range", copy: "New small-batch launches every season." },
];

export function WhyLuxa() {
  const { t } = useSettings();
  return (
    <section className="bg-background py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <p className="text-eyebrow text-olive">{t("why.eyebrow", "Why Luxa Naturals")}</p>
          <h2 className="mt-5 font-display text-4xl sm:text-5xl">{t("why.title", "Built on trust, not trends")}</h2>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {PILLARS.map((p, i) => (
            <div
              key={p.title}
              className="group border border-border bg-card p-8 transition-all duration-700 hover:-translate-y-2 hover:border-gold/50 hover:shadow-luxe"
              data-reveal
              data-reveal-delay={i * 90}
            >
              <span className="grid size-12 place-items-center rounded-full bg-cream text-olive transition-colors duration-500 group-hover:bg-gradient-gold group-hover:text-charcoal">
                <p.icon className="size-5" />
              </span>
              <h3 className="mt-6 font-display text-lg">{p.title}</h3>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{p.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Ingredients ------------------------------ */

const INGREDIENTS = [
  { name: "Honey", note: "Raw, unpasteurised, enzyme-rich" },
  { name: "Botanical Extracts", note: "Cold-macerated flowers & roots" },
  { name: "Natural Oils", note: "First cold-press, unrefined" },
  { name: "Herbal Ingredients", note: "Ayurvedic single herbs" },
];

export function Ingredients() {
  const { t } = useSettings();
  return (
    <section className="relative overflow-hidden bg-gradient-forest py-28 text-cream">
      <div className="absolute -top-16 -left-10 size-72 rounded-full bg-olive/20 blur-3xl" />
      <div className="absolute -right-10 bottom-0 size-80 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <p className="text-eyebrow text-gold">{t("ingredients.eyebrow", "Inside Every Bottle")}</p>
          <h2 className="mt-5 font-display text-4xl sm:text-5xl">{t("ingredients.title", "Ingredients you can trace")}</h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {INGREDIENTS.map((ing, i) => (
            <div
              key={ing.name}
              className="glass-dark group p-8 text-center transition-all duration-700 hover:-translate-y-2"
              data-reveal
              data-reveal-delay={i * 110}
            >
              <span
                className="mx-auto grid size-16 place-items-center rounded-full border border-gold/40 text-gold"
                style={{ animation: `float-mid ${6 + i}s ease-in-out infinite` }}
              >
                <Leaf className="size-6" />
              </span>
              <h3 className="mt-6 font-display text-xl text-cream">{ing.name}</h3>
              <p className="mt-2 text-xs tracking-wider text-cream/60">{ing.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Testimonials ------------------------------ */

const REVIEWS = [
  {
    quote:
      "The wild forest honey ruined every supermarket jar for me. You can actually taste the grove it came from.",
    name: "Ananya R.",
    role: "Verified Buyer, Mumbai",
  },
  {
    quote:
      "Three months on the plant protein and skin capsules — my energy and skin have never been steadier.",
    name: "Kabir M.",
    role: "Verified Buyer, Delhi",
  },
  {
    quote:
      "The night balm feels like a spa ritual. Beautiful packaging, and it smells like a real garden.",
    name: "Meera S.",
    role: "Verified Buyer, Bengaluru",
  },
];

export function Testimonials() {
  const { t } = useSettings();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setActive((i) => (i + 1) % REVIEWS.length), 5200);
    return () => window.clearInterval(t);
  }, []);

  return (
    <section className="relative overflow-hidden bg-cream py-28">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <p className="text-eyebrow text-olive" data-reveal>
          Kind Words
        </p>
        <h2 className="mt-5 font-display text-4xl sm:text-5xl" data-reveal>
          {t("reviews.title", "Loved in 18,000+ homes")}
        </h2>

        <div className="relative mt-14 min-h-[280px]">
          {REVIEWS.map((r, i) => (
            <div
              key={r.name}
              className={`glass absolute inset-0 flex flex-col items-center justify-center p-12 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                i === active ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0"
              }`}
            >
              <Quote className="size-7 text-gold" />
              <p className="mt-7 font-display text-xl leading-relaxed text-foreground italic sm:text-2xl">
                “{r.quote}”
              </p>
              <p className="mt-8 text-xs tracking-[0.24em] text-olive uppercase">{r.name}</p>
              <p className="mt-2 text-[0.65rem] tracking-wider text-muted-foreground">{r.role}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-3">
          {REVIEWS.map((r, i) => (
            <button
              key={r.name}
              aria-label={`Review ${i + 1}`}
              onClick={() => setActive(i)}
              className={`h-px w-10 transition-all duration-500 ${
                i === active ? "bg-gradient-gold" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- Blog ---------------------------------- */

const POSTS = [
  {
    title: "Why raw honey never crystallises the same way twice",
    meta: "Honey · 6 min read",
    img: honey,
    featured: true,
  },
  { title: "The morning protein ritual, rebuilt for Indian kitchens", meta: "Nutrition · 4 min read", img: nutrition },
  { title: "Cold-pressed oils: what your skin actually absorbs", meta: "Skincare · 5 min read", img: cosmetics },
];

export function Journal() {
  const { t } = useSettings();
  return (
    <section id="journal" className="bg-background py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6" data-reveal>
          <div>
            <p className="text-eyebrow text-olive">The Luxa Journal</p>
            <h2 className="mt-5 font-display text-4xl sm:text-5xl">{t("journal.title", "Notes from the grove")}</h2>
          </div>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-[0.65rem] tracking-[0.24em] text-olive uppercase transition-colors hover:text-gold"
          >
            All Articles <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <article className="group relative overflow-hidden" data-reveal>
            <img
              src={POSTS[0]!.img}
              alt={POSTS[0]!.title}
              loading="lazy"
              width={1024}
              height={1280}
              className="aspect-[4/3] w-full object-cover transition-transform duration-[1400ms] group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,oklch(0.2_0.02_140/0.9))] p-10">
              <p className="text-[0.6rem] tracking-[0.28em] text-gold uppercase">{POSTS[0]!.meta}</p>
              <h3 className="mt-4 max-w-md font-display text-2xl text-cream sm:text-3xl">
                {POSTS[0]!.title}
              </h3>
            </div>
          </article>

          <div className="flex flex-col gap-8">
            {POSTS.slice(1).map((p, i) => (
              <article
                key={p.title}
                className="group flex items-center gap-6 border border-border bg-card p-6 transition-all duration-700 hover:border-gold/50 hover:shadow-luxe"
                data-reveal
                data-reveal-delay={(i + 1) * 120}
              >
                <img
                  src={p.img}
                  alt={p.title}
                  loading="lazy"
                  width={1024}
                  height={1280}
                  className="size-28 shrink-0 object-cover"
                />
                <div>
                  <p className="text-[0.6rem] tracking-[0.28em] text-olive uppercase">{p.meta}</p>
                  <h3 className="mt-3 font-display text-lg leading-snug">{p.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Newsletter ------------------------------- */

export function Newsletter() {
  const { t } = useSettings();
  return (
    <section className="bg-cream px-6 py-24">
      <div
        className="relative mx-auto max-w-5xl overflow-hidden bg-gradient-forest px-8 py-16 text-center sm:px-16"
        data-reveal
      >
        <div className="absolute -top-20 left-1/2 size-72 -translate-x-1/2 rounded-full bg-gold/15 blur-3xl" />
        <div className="relative">
          <p className="text-eyebrow text-gold">{t("newsletter.eyebrow", "Join The Ritual")}</p>
          <h2 className="mt-5 font-display text-3xl text-cream sm:text-4xl">
            {t("newsletter.title", "10% off your first ritual box")}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm text-cream/65">
            {t("newsletter.subtitle", "Seasonal harvest notes, early access to small-batch launches, and members-only offers.")}
          </p>

          <form
            className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Thank you! You've successfully subscribed to Luxa Naturals.");
              (e.target as HTMLFormElement).reset();
            }}
          >
            <input
              type="email"
              required
              placeholder="Your email address"
              aria-label="Email address"
              className="glass-dark flex-1 px-5 py-4 text-sm text-cream placeholder:text-cream/45 focus:outline-none focus:ring-1 focus:ring-gold"
            />
            <button
              type="submit"
              className="bg-gradient-gold px-8 py-4 text-[0.65rem] tracking-[0.24em] text-charcoal uppercase shadow-gold transition-transform duration-500 hover:-translate-y-1"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
