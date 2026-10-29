import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, Heart, X, User as UserIcon, Instagram, Facebook, Youtube, Mail, Phone, MapPin } from "lucide-react";

import { Link, useLocation } from "@tanstack/react-router";
import { inr } from "@/lib/api";
import { useAuth, useCart, useCategories, useProducts, useSettings } from "@/lib/store";

export function Logo({}: { tone?: "light" | "dark" }) {
  const { settings } = useSettings();
  return (
    <Link to="/" className="flex flex-col items-center gap-2">
      <img src={settings.logo || "/logo.png"} alt={settings.businessName} className="h-14 w-auto object-contain" />
    </Link>
  );
}

export function AnnouncementBar() {
  const { settings } = useSettings();
  if (!settings.announcement) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-[60] bg-gradient-gold py-1.5 text-center text-[0.65rem] font-semibold tracking-[0.2em] text-charcoal uppercase">
      {settings.announcement}
    </div>
  );
}

function SearchResults({ query, onPick }: { query: string; onPick: () => void }) {
  const { data: results = [], isFetching } = useProducts({ q: query, limit: "12" });
  if (isFetching && results.length === 0) return <p className="text-center text-cream/40">Searching…</p>;
  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-cream/40 px-4">
        <p className="text-lg mb-2">No products found matching "{query}"</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {results.map((p) => (
        <Link
          key={p._id}
          to="/product/$productId"
          params={{ productId: p.slug }}
          onClick={onPick}
          className="flex items-center gap-6 p-4 rounded-xl hover:bg-cream/5 transition-colors group"
        >
          <img src={p.images[0]} alt={p.name} className="w-16 h-16 rounded-lg object-cover" />
          <div>
            <h4 className="font-display text-xl text-cream group-hover:text-gold transition-colors">{p.name}</h4>
            <p className="text-sm text-cream/50">{inr(p.price)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const location = useLocation();
  const { data: categories = [] } = useCategories();
  const { user } = useAuth();
  const { count } = useCart();
  const { settings } = useSettings();
  const isHome = location.pathname === "/";
  const solid = !isHome || scrolled;

  const NAV = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Products", href: "/products" },
    ...categories.map((c) => ({ label: c.name, href: `/category/${c.slug}` })),
    { label: "Blog", href: "/blog" },
    { label: "Contact Us", href: "/contact" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchQuery.trim()), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <header
      className={`fixed inset-x-0 z-50 transition-all duration-700 ${settings.announcement ? "top-7" : "top-0"} ${
        solid ? "bg-forest text-cream py-2 shadow-luxe" : "border-b border-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <div>
          <Logo />
        </div>

        <nav className="hidden items-center gap-4 lg:flex xl:gap-7">
          {NAV.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`relative whitespace-nowrap text-[10px] xl:text-xs tracking-[0.15em] xl:tracking-[0.2em] uppercase transition-colors after:absolute after:-bottom-2 after:left-0 after:h-px after:w-0 after:bg-gold after:transition-all after:duration-500 hover:after:w-full ${
                solid ? "text-cream hover:text-gold" : "text-cream/85 hover:text-gold"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={`flex items-center gap-5 ${solid ? "text-cream" : "text-cream/90"}`}>
          <button aria-label="Search" onClick={() => setIsSearchOpen(true)} className="transition-colors hover:text-gold">
            <Search className="size-[18px]" />
          </button>
          <Link to="/account" search={{ tab: "wishlist" }} aria-label="Wishlist" className="hidden transition-colors hover:text-gold sm:block">
            <Heart className="size-[18px]" />
          </Link>
          <Link to={user ? "/account" : "/login"} aria-label="Account" className="transition-colors hover:text-gold">
            <UserIcon className="size-[18px]" />
          </Link>
          <Link to="/cart" aria-label="Cart" className="relative flex items-center transition-colors hover:text-gold">
            <ShoppingBag className="size-[18px]" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2.5 grid size-4 place-items-center rounded-full bg-gold text-[0.6rem] font-bold text-charcoal">
                {count}
              </span>
            )}
          </Link>
          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="transition-colors hover:text-gold lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="bg-forest border border-gold/30 mx-6 mt-3 flex flex-col gap-4 rounded-lg p-6 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setOpen(false)}
              className="text-xs tracking-[0.2em] text-cream/90 uppercase hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
          <Link to={user ? "/account" : "/login"} onClick={() => setOpen(false)} className="text-xs tracking-[0.2em] text-gold uppercase">
            {user ? "My Account" : "Login"}
          </Link>
        </nav>
      )}

      {/* Full-screen Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-charcoal/95 backdrop-blur-md px-6 py-10 overflow-y-auto w-screen h-screen">
          <div className="mx-auto w-full max-w-2xl mt-10">
            <div className="flex justify-between items-center mb-10">
              <h2 className="font-display text-4xl text-cream">Search</h2>
              <button aria-label="Close search" onClick={closeSearch} className="text-cream/50 hover:text-gold transition-colors p-2">
                <X className="size-8" />
              </button>
            </div>

            <div className="relative mb-8">
              <input
                type="text"
                autoFocus
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-b border-gold/40 text-cream text-2xl py-4 focus:outline-none focus:border-gold placeholder:text-cream/20 transition-colors"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gold/50 size-6" />
            </div>

            {debounced.length > 0 && <SearchResults query={debounced} onPick={closeSearch} />}
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const { settings, t } = useSettings();
  const s = settings.social;
  return (
    <footer className="bg-gradient-forest text-cream py-16 text-center">
      <div className="mx-auto max-w-4xl px-6 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center">
          <Logo tone="dark" />
          <p className="mt-4 text-xs text-gold tracking-widest uppercase">{settings.tagline}</p>
        </div>

        {(settings.contactEmail || settings.contactPhone || settings.address) && (
          <div className="flex flex-wrap justify-center gap-6 text-xs text-cream/70">
            {settings.contactEmail && (
              <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-2 hover:text-gold">
                <Mail className="size-3.5" /> {settings.contactEmail}
              </a>
            )}
            {settings.contactPhone && (
              <a href={`tel:${settings.contactPhone}`} className="flex items-center gap-2 hover:text-gold">
                <Phone className="size-3.5" /> {settings.contactPhone}
              </a>
            )}
            {settings.address && (
              <span className="flex items-center gap-2">
                <MapPin className="size-3.5" /> {settings.address}
              </span>
            )}
          </div>
        )}

        {(s?.instagram || s?.facebook || s?.youtube) && (
          <div className="flex gap-5 text-cream/70">
            {s.instagram && <a href={s.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-gold"><Instagram className="size-5" /></a>}
            {s.facebook && <a href={s.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-gold"><Facebook className="size-5" /></a>}
            {s.youtube && <a href={s.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="hover:text-gold"><Youtube className="size-5" /></a>}
          </div>
        )}

        <p className="mt-4 text-xs text-cream/50 tracking-wider">
          © {new Date().getFullYear()} {settings.businessName}. {t("footer.rights", "All Rights Reserved.")}
        </p>

        <div className="hairline my-6 w-24 mx-auto opacity-30" />

        <div className="space-y-4 text-xs text-cream/70 tracking-wide">
          <p>
            <strong className="text-gold mr-2 font-medium">Quick Links:</strong>
            <Link to="/about" className="hover:text-gold transition-colors">About Us</Link> <span className="mx-2 opacity-30">|</span>
            <Link to="/products" className="hover:text-gold transition-colors">Products</Link> <span className="mx-2 opacity-30">|</span>
            <Link to="/blog" className="hover:text-gold transition-colors">Blog</Link> <span className="mx-2 opacity-30">|</span>
            <Link to="/contact" className="hover:text-gold transition-colors">Contact Us</Link> <span className="mx-2 opacity-30">|</span>
            <Link to="/account" className="hover:text-gold transition-colors">My Account</Link>
          </p>
          <p>
            <strong className="text-gold mr-2 font-medium">Policies:</strong>
            <Link to="/privacy-policy" className="hover:text-gold transition-colors">Privacy Policy</Link> <span className="mx-2 opacity-30">|</span>
            <Link to="/terms-and-conditions" className="hover:text-gold transition-colors">Terms & Conditions</Link> <span className="mx-2 opacity-30">|</span>
            <Link to="/shipping-and-delivery" className="hover:text-gold transition-colors">Shipping & Delivery</Link> <span className="mx-2 opacity-30">|</span>
            <Link to="/refund-and-cancellation" className="hover:text-gold transition-colors">Refund & Cancellation Policy</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
