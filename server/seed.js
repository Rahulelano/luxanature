import fs from "node:fs";
import path from "node:path";
import { Category, Product } from "./models/index.js";
import { slugify } from "./lib/util.js";
import { UPLOAD_DIR } from "./routes/admin.js";

// Copies the bundled demo images into /uploads so seeded products have pictures.
function seedImage(name) {
  const src = path.resolve(process.cwd(), "src/assets", name);
  const dest = path.join(UPLOAD_DIR, `seed-${name}`);
  if (fs.existsSync(src) && !fs.existsSync(dest)) fs.copyFileSync(src, dest);
  return `/uploads/seed-${name}`;
}

const CATS = [
  {
    name: "Honey Products",
    slug: "honey-products",
    img: "cat-honey.jpg",
    description:
      "Discover the natural goodness of honey with our carefully selected range of honey-based products.",
    subs: ["Pure Honey", "Natural Honey Blends", "Honey-Based Wellness Products", "Specialty Honey Products", "Gift & Premium Honey Collections"],
  },
  {
    name: "Nutritional Products",
    slug: "nutritional-products",
    img: "cat-nutrition.jpg",
    description:
      "Our nutritional range is developed for people looking to make better choices for their everyday lifestyle.",
    subs: ["Nutritional Supplements", "Wellness Products", "Functional Nutrition", "Natural Ingredient-Based Products", "Daily Nutrition Products"],
  },
  {
    name: "Cosmetics",
    slug: "cosmetics",
    img: "cat-cosmetics.jpg",
    description: "Experience nature-inspired personal care with the Luxa Naturals cosmetics collection.",
    subs: ["Skin Care", "Hair Care", "Body Care", "Natural Beauty", "Personal Care"],
  },
];

const PRODUCTS = [
  ["Wild Forest Raw Honey", 0, "Pure Honey", 1450, 1750, "Best Seller", true, false],
  ["Golden Manuka Reserve", 0, "Specialty Honey Products", 3650, 0, "Limited", true, false],
  ["Acacia Blossom Honey", 0, "Pure Honey", 1190, 0, "", false, true],
  ["Comb Honey Gift Box", 0, "Gift & Premium Honey Collections", 2950, 0, "", false, true],
  ["Botanical Plant Protein", 1, "Functional Nutrition", 2290, 0, "New", true, false],
  ["Radiance Skin Capsules", 1, "Nutritional Supplements", 1890, 0, "", false, true],
  ["Herbal Immunity Blend", 1, "Wellness Products", 1340, 0, "", false, true],
  ["Olive & Honey Night Balm", 2, "Skin Care", 1980, 0, "", true, false],
  ["Cold-Pressed Face Serum", 2, "Skin Care", 2450, 0, "", false, true],
  ["Honey Glow Body Oil", 2, "Body Care", 1690, 0, "", false, true],
];

export async function seedIfEmpty() {
  if (await Category.estimatedDocumentCount()) return;
  console.log("Seeding demo categories & products…");
  const created = [];
  for (const [i, c] of CATS.entries()) {
    const image = seedImage(c.img);
    const parent = await Category.create({ name: c.name, slug: c.slug, description: c.description, image, order: i });
    const subs = {};
    for (const [j, s] of c.subs.entries()) {
      subs[s] = await Category.create({ name: s, slug: slugify(`${c.slug}-${s}`), parent: parent._id, order: j });
    }
    created.push({ parent, subs, image });
  }
  for (const [name, ci, sub, price, mrp, tag, featured, bestSeller] of PRODUCTS) {
    const c = created[ci];
    await Product.create({
      name,
      slug: slugify(name),
      price,
      mrp,
      tag,
      featured,
      bestSeller,
      stock: 50,
      category: c.parent._id,
      subcategory: c.subs[sub]?._id ?? null,
      images: [c.image],
      rating: 5,
      reviewsCount: 0,
      description:
        "Sourced responsibly and formulated to support your everyday wellness, bringing nature's finest qualities to your daily ritual.",
      ingredients: "Pure natural extracts, responsibly sourced elements.",
      benefits: "Supports everyday wellness and brings the goodness of nature closer to you.",
    });
  }
}
