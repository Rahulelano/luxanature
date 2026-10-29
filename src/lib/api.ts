export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function api<T = any>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const init: RequestInit = { method: options.method ?? (options.body ? "POST" : "GET"), credentials: "include" };
  if (options.body) {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(options.body);
  }
  const res = await fetch(`/api${path}`, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || "Request failed");
  return data as T;
}

export async function uploadImages(files: FileList | File[]): Promise<string[]> {
  const fd = new FormData();
  Array.from(files).forEach((f) => fd.append("files", f));
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd, credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || "Upload failed");
  return data.urls;
}

export function shippingFor(subtotal: number, fee: number, freeAbove: number) {
  if (subtotal === 0) return 0;
  return freeAbove > 0 && subtotal >= freeAbove ? 0 : fee;
}

export const inr = (n: number) => "₹" + Number(n || 0).toLocaleString("en-IN");

/* ---------------------------------- Types ---------------------------------- */
export type CategoryRef = { _id: string; name: string; slug: string };

export type Category = CategoryRef & {
  description: string;
  image: string;
  parent: string | null;
  order: number;
  active: boolean;
  children?: Category[];
};

export type Product = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  ingredients: string;
  benefits: string;
  price: number;
  mrp: number;
  stock: number;
  sku: string;
  category: CategoryRef;
  subcategory: CategoryRef | null;
  images: string[];
  tag: string;
  featured: boolean;
  bestSeller: boolean;
  active: boolean;
  rating: number;
  reviewsCount: number;
};

export type Address = {
  _id?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
};

export type User = {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: "user" | "admin";
  addresses: Address[];
  wishlist: string[];
};

export type Order = {
  _id: string;
  orderNumber: string;
  email: string;
  items: { product: string; name: string; slug: string; image: string; price: number; qty: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  address: Address;
  paymentMethod: "razorpay" | "cod";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  status: "pending_payment" | "placed" | "confirmed" | "shipped" | "delivered" | "cancelled";
  trackingNumber: string;
  notes: string;
  history: { status: string; at: string; note?: string }[];
  createdAt: string;
};

export type Settings = {
  businessName: string;
  tagline: string;
  logo: string;
  favicon: string;
  heroImage: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  whatsapp: string;
  social: { instagram: string; facebook: string; youtube: string };
  announcement: string;
  texts: Record<string, string>;
  currency: string;
  shippingFee: number;
  freeShippingAbove: number;
  codEnabled: boolean;
  razorpayEnabled: boolean;
  razorpayKeyId: string;
  hasRazorpaySecret?: boolean;
  hasWebhookSecret?: boolean;
};

export const STATUS_LABEL: Record<Order["status"], string> = {
  pending_payment: "Awaiting payment",
  placed: "Placed",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
