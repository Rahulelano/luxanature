import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, type Category, type Product, type Settings, type User } from "./api";

/* ------------------------------- Site settings ------------------------------- */
export const DEFAULT_SETTINGS: Settings = {
  businessName: "Luxa Naturals",
  tagline: "Nature. Quality. Everyday Wellness.",
  logo: "/logo.png",
  favicon: "/logo.png",
  heroImage: "",
  contactEmail: "",
  contactPhone: "",
  address: "",
  whatsapp: "",
  social: { instagram: "", facebook: "", youtube: "" },
  announcement: "",
  texts: {},
  currency: "INR",
  shippingFee: 0,
  freeShippingAbove: 0,
  codEnabled: true,
  razorpayEnabled: false,
  razorpayKeyId: "",
};

export function useSettings() {
  const { data } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api<{ settings: Settings }>("/settings").then((r) => r.settings),
    staleTime: 60_000,
  });
  const settings = data ?? DEFAULT_SETTINGS;
  // t("hero.title1", "Nature. Quality.") → admin's wording if set, otherwise the default.
  const t = useCallback((key: string, fallback: string) => settings.texts?.[key] || fallback, [settings]);
  return { settings, t, loaded: !!data };
}

/** Keeps the browser tab title and favicon in sync with admin settings. */
export function useDocumentBranding() {
  const { settings, loaded } = useSettings();
  useEffect(() => {
    if (!loaded) return;
    document.title = `${settings.businessName} — ${settings.tagline}`;
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = settings.favicon || settings.logo;
  }, [settings, loaded]);
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api<{ categories: Category[] }>("/categories").then((r) => r.categories),
    staleTime: 60_000,
  });
}

export function useProducts(params: Record<string, string | undefined> = {}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString();
  return useQuery({
    queryKey: ["products", qs],
    queryFn: () => api<{ products: Product[] }>(`/products${qs ? `?${qs}` : ""}`).then((r) => r.products),
    staleTime: 30_000,
  });
}

/* ----------------------------------- Auth ----------------------------------- */
export function useAuth() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => api<{ user: User | null }>("/auth/me").then((r) => r.user),
    staleTime: 60_000,
  });
  const setUser = (u: User | null) => qc.setQueryData(["me"], u);
  const logout = async () => {
    await api("/auth/logout", { method: "POST" });
    setUser(null);
    qc.removeQueries({ queryKey: ["my-orders"] });
  };
  return { user: data ?? null, isLoading, setUser, logout };
}

export function useWishlist() {
  const { user, setUser } = useAuth();
  const has = (id: string) => !!user?.wishlist?.some((w) => w === id);
  const toggle = async (p: Product) => {
    if (!user) {
      toast.info("Please log in to use your wishlist");
      return false;
    }
    const r = await api<{ user: User; added: boolean }>(`/auth/wishlist/${p._id}`, { method: "POST" });
    setUser(r.user);
    toast.success(r.added ? `${p.name} added to wishlist` : `${p.name} removed from wishlist`);
    return true;
  };
  return { has, toggle };
}

/* ----------------------------------- Cart ----------------------------------- */
export type CartItem = { productId: string; slug: string; name: string; price: number; image: string; qty: number; stock: number };

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (p: Product, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartCtx | null>(null);
const CART_KEY = "luxa_cart";

function readCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readCart);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items]);

  const value = useMemo<CartCtx>(
    () => ({
      items,
      count: items.reduce((a, i) => a + i.qty, 0),
      subtotal: items.reduce((a, i) => a + i.qty * i.price, 0),
      add: (p, qty = 1) => {
        if (p.stock <= 0) {
          toast.error(`${p.name} is out of stock`);
          return;
        }
        setItems((prev) => {
          const found = prev.find((i) => i.productId === p._id);
          if (found) {
            return prev.map((i) => (i.productId === p._id ? { ...i, qty: Math.min(i.qty + qty, p.stock) } : i));
          }
          return [
            ...prev,
            { productId: p._id, slug: p.slug, name: p.name, price: p.price, image: p.images[0] || "", qty: Math.min(qty, p.stock), stock: p.stock },
          ];
        });
        toast.success(`${p.name} added to cart`);
      },
      setQty: (id, qty) =>
        setItems((prev) => prev.map((i) => (i.productId === id ? { ...i, qty: Math.max(1, Math.min(qty, i.stock || 99)) } : i))),
      remove: (id) => setItems((prev) => prev.filter((i) => i.productId !== id)),
      clear: () => setItems([]),
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
