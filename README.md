# Luxa Naturals Emporium

Create a world-class premium e-commerce website for Luxa Naturals, a luxury nature-inspired wellness brand specializing in Honey Products, Nutritional Products, and Cosmetics.

Design Style:

Modern Luxury + Organic Wellness

Apple-level premium UI

Forest-inspired aesthetics

Soft glassmorphism effects

Elegant animations

High-end product presentation

Premium organic brand feel

Color Palette:

Olive Green (#6B8E23)

Luxury Gold (#D4AF37)

Cream Beige (#F5F2E8)

White (#FFFFFF)

Charcoal Black (#1C1C1C)

Typography:

Playfair Display for headings

Poppins for body content

Elegant luxury spacing

Homepage Sections:

HERO SECTION

Full-screen cinematic hero

Floating honey drops

Botanical leaves animation

Premium luxury background

Large logo placement

Headline:
"Nature. Quality. Everyday Wellness."

CTA Buttons:
Shop Now
Explore Products

BRAND STORY

Luxury split layout

Nature-inspired visuals

Animated counters

Premium storytelling section

PRODUCT CATEGORIES

Honey Products

Nutritional Products

Cosmetics

Hover effects

3D product cards

Smooth transitions

FEATURED PRODUCTS

Premium product showcase

Add to Cart

Quick View

Wishlist

Product ratings

WHY LUXA NATURALS

Nature Inspired

Quality Focused

Modern & Convenient

Customer First

Growing Product Range

BEST SELLERS

Luxury product carousel

Auto-slide animation

INGREDIENTS SECTION

Honey

Botanical Extracts

Natural Oils

Herbal Ingredients

Animated ingredient showcase

CUSTOMER TESTIMONIALS

Glassmorphism cards

Premium review slider

BLOG SECTION

Modern magazine-style layout

Large featured articles

NEWSLETTER SECTION

Elegant subscription area

Gold gradient CTA

FOOTER

Luxury dark theme footer

Social links

Quick links

Policies

Contact information

Animations:

GSAP Premium Animations

Smooth scrolling

Parallax effects

Floating leaves

Fade-up transitions

Luxury hover effects

Micro interactions

E-Commerce Features:

Product filtering

Category pages

Product details page

Secure checkout

Razorpay integration

Wishlist

Reviews

Coupons

Inventory management

Order tracking

Overall Feel:
The website should feel like a blend of luxury skincare brands, premium organic wellness brands, and modern D2C companies. Every section should communicate trust, purity, nature, quality, and premium value while maintaining a clean, elegant shopping experience.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/32b82337-999c-455a-b61b-069e2abdad79).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Full-stack setup (Express + MongoDB backend)

1. Copy `.env.example` to `.env` and fill in MongoDB URI, Gmail address + 16-char app password, `JWT_SECRET`, and `ADMIN_EMAILS`.
2. `npm install`
3. `npm run dev` — starts the API (port 5000) and the site (http://localhost:5173) together.
4. Log in at `/login` with an email from `ADMIN_EMAILS` → you land in `/admin`.

Production: `npm run build` then `npm start` — one Node server serves the API, `/uploads`, and the built site on `PORT`.
Uploaded images are saved to `uploads/` — keep that folder on persistent disk and back it up.

Razorpay: Admin → Payments & Shipping → paste Key ID + Key Secret → Save → "Test saved keys" → turn on.
Optional webhook: `https://<your-domain>/api/payments/webhook`, event `payment.captured`, then paste its secret in admin.
