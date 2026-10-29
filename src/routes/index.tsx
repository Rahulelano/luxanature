import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/luxa/Hero";
import {
  BrandStory,
  Categories,
  WhyLuxa,
  Ingredients,
  Testimonials,
  Journal,
  Newsletter,
} from "@/components/luxa/Sections";
import { FeaturedProducts, BestSellers } from "@/components/luxa/Products";
import { useReveal } from "@/hooks/use-reveal";

const TITLE = "Luxa Naturals — Luxury Honey, Nutrition & Natural Cosmetics";
const DESCRIPTION =
  "Raw single-origin honey, botanical nutrition and cold-pressed skincare, crafted in small batches for everyday wellness.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <div ref={ref}>
      <main>
        <Hero />
        <BrandStory />
        <Categories />
        <FeaturedProducts />
        <WhyLuxa />
        <BestSellers />
        <Ingredients />
        <Testimonials />
        <Journal />
        <Newsletter />
      </main>
    </div>
  );
}
