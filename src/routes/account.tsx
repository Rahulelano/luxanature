import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Package, User as UserIcon, MapPin, Heart, LogOut, Shield, Trash2 } from "lucide-react";
import { api, inr, STATUS_LABEL, type Address, type Order, type Product, type User } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { ProductCard } from "@/components/luxa/Products";

type Tab = "orders" | "profile" | "addresses" | "wishlist";

export const Route = createFileRoute("/account")({
  validateSearch: (s: Record<string, unknown>): { tab?: Tab } =>
    ["orders", "profile", "addresses", "wishlist"].includes(s["tab"] as string) ? { tab: s["tab"] as Tab } : {},
  component: AccountPage,
});

const input = "w-full bg-white border border-gold/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-olive";

function AccountPage() {
  const { tab = "orders" } = Route.useSearch();
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) navigate({ to: "/login", search: { redirect: "/account" } });
  }, [isLoading, user]);

  if (!user) return <div className="pt-40 text-center text-charcoal/50">Loading…</div>;

  const TABS: { id: Tab; label: string; icon: typeof Package }[] = [
    { id: "orders", label: "My Orders", icon: Package },
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "wishlist", label: "Wishlist", icon: Heart },
  ];

  return (
    <div className="pt-32 pb-24 max-w-6xl mx-auto px-6 text-charcoal">
      <h1 className="font-display text-4xl text-forest">Hello{user.name ? `, ${user.name}` : ""} 🌿</h1>
      <p className="text-sm text-charcoal/60 mt-2">{user.email}</p>

      <div className="mt-10 grid md:grid-cols-4 gap-8">
        <aside className="space-y-2">
          {TABS.map((t) => (
            <Link
              key={t.id}
              to="/account"
              search={{ tab: t.id }}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${tab === t.id ? "bg-forest text-cream" : "hover:bg-cream"}`}
            >
              <t.icon className="size-4" /> {t.label}
            </Link>
          ))}
          {user.role === "admin" && (
            <Link to="/admin" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gold hover:bg-cream">
              <Shield className="size-4" /> Admin Panel
            </Link>
          )}
          <button
            onClick={async () => {
              await logout();
              navigate({ to: "/" });
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="size-4" /> Logout
          </button>
        </aside>

        <section className="md:col-span-3">
          {tab === "orders" && <OrdersTab />}
          {tab === "profile" && <ProfileTab user={user} />}
          {tab === "addresses" && <AddressesTab user={user} />}
          {tab === "wishlist" && <WishlistTab />}
        </section>
      </div>
    </div>
  );
}

function OrdersTab() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => api<{ orders: Order[] }>("/orders/mine").then((r) => r.orders),
  });
  if (isLoading) return <p className="text-charcoal/50">Loading orders…</p>;
  if (orders.length === 0) {
    return (
      <div className="bg-cream rounded-3xl p-12 text-center">
        <p className="text-charcoal/60 mb-6">You haven't placed any orders yet.</p>
        <Link to="/products" className="bg-forest text-cream px-8 py-3 rounded-full text-xs font-semibold tracking-widest uppercase">Start Shopping</Link>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <Link key={o._id} to="/orders/$orderId" params={{ orderId: o._id }} className="flex flex-wrap items-center gap-4 bg-cream rounded-2xl p-5 hover:shadow-luxe transition-shadow">
          <div className="flex -space-x-3">
            {o.items.slice(0, 3).map((i) => (
              <img key={i.product} src={i.image} alt="" className="size-12 rounded-full border-2 border-cream object-cover" />
            ))}
          </div>
          <div className="flex-1 min-w-40">
            <p className="font-medium">{o.orderNumber}</p>
            <p className="text-xs text-charcoal/60">
              {new Date(o.createdAt).toLocaleDateString("en-IN")} · {o.items.reduce((a, i) => a + i.qty, 0)} item(s)
            </p>
          </div>
          <span className="font-medium">{inr(o.total)}</span>
          <span className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider ${o.status === "cancelled" ? "bg-red-100 text-red-700" : o.status === "pending_payment" ? "bg-gold/20 text-charcoal" : "bg-olive/10 text-olive"}`}>
            {STATUS_LABEL[o.status]}
          </span>
        </Link>
      ))}
    </div>
  );
}

function ProfileTab({ user }: { user: User }) {
  const { setUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUser((await api<{ user: User }>("/auth/profile", { method: "PUT", body: { name, phone } })).user);
      toast.success("Profile saved");
    } catch (err: any) {
      toast.error(err.message);
    }
  };
  return (
    <form onSubmit={save} className="bg-cream rounded-3xl p-8 space-y-4 max-w-lg">
      <label className="block text-xs uppercase tracking-wider text-charcoal/60">Email</label>
      <input className={input + " opacity-60"} value={user.email} disabled />
      <label className="block text-xs uppercase tracking-wider text-charcoal/60">Full name</label>
      <input className={input} value={name} onChange={(e) => setName(e.target.value)} />
      <label className="block text-xs uppercase tracking-wider text-charcoal/60">Phone</label>
      <input className={input} value={phone} onChange={(e) => setPhone(e.target.value)} />
      <button className="bg-forest text-cream px-8 py-3 rounded-full text-xs font-semibold tracking-widest uppercase hover:bg-olive">Save</button>
    </form>
  );
}

const EMPTY: Address = { fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", isDefault: false };

function AddressesTab({ user }: { user: User }) {
  const { setUser } = useAuth();
  const [editing, setEditing] = useState<Address | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      const r = editing._id
        ? await api<{ user: User }>(`/auth/addresses/${editing._id}`, { method: "PUT", body: editing })
        : await api<{ user: User }>("/auth/addresses", { body: editing });
      setUser(r.user);
      setEditing(null);
      toast.success("Address saved");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const del = async (id: string) => {
    setUser((await api<{ user: User }>(`/auth/addresses/${id}`, { method: "DELETE" })).user);
  };

  if (editing) {
    const f = (k: keyof Address, label: string) => (
      <input className={input} placeholder={label} value={(editing[k] as string) || ""} onChange={(e) => setEditing({ ...editing, [k]: e.target.value })} />
    );
    return (
      <form onSubmit={save} className="bg-cream rounded-3xl p-8 space-y-4 max-w-xl">
        <div className="grid grid-cols-2 gap-4">{f("fullName", "Full name *")}{f("phone", "Phone *")}</div>
        {f("line1", "Address line 1 *")}
        {f("line2", "Address line 2")}
        <div className="grid grid-cols-3 gap-4">{f("city", "City *")}{f("state", "State *")}{f("pincode", "PIN *")}</div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!editing.isDefault} onChange={(e) => setEditing({ ...editing, isDefault: e.target.checked })} /> Default address
        </label>
        <div className="flex gap-3">
          <button className="bg-forest text-cream px-8 py-3 rounded-full text-xs font-semibold tracking-widest uppercase">Save</button>
          <button type="button" onClick={() => setEditing(null)} className="px-6 py-3 text-xs uppercase tracking-widest text-charcoal/60">Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      {user.addresses.map((a) => (
        <div key={a._id} className="flex items-start justify-between gap-4 bg-cream rounded-2xl p-5 text-sm">
          <div>
            <p className="font-medium">
              {a.fullName} · {a.phone} {a.isDefault && <span className="ml-2 text-[0.6rem] uppercase tracking-wider text-olive">Default</span>}
            </p>
            <p className="text-charcoal/70 mt-1">
              {a.line1}
              {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} – {a.pincode}
            </p>
          </div>
          <div className="flex gap-3 text-xs">
            <button onClick={() => setEditing(a)} className="text-olive hover:text-gold">Edit</button>
            <button onClick={() => del(a._id!)} className="text-red-500" aria-label="Delete address"><Trash2 className="size-4" /></button>
          </div>
        </div>
      ))}
      <button onClick={() => setEditing({ ...EMPTY })} className="border border-dashed border-gold/50 w-full rounded-2xl py-5 text-sm text-olive hover:bg-cream">
        + Add new address
      </button>
    </div>
  );
}

function WishlistTab() {
  const { user } = useAuth();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["wishlist", user?.wishlist.join(",")],
    queryFn: () => api<{ products: Product[] }>("/auth/wishlist").then((r) => r.products),
  });
  if (isLoading) return <p className="text-charcoal/50">Loading…</p>;
  if (products.length === 0) return <p className="bg-cream rounded-3xl p-12 text-center text-charcoal/60">Your wishlist is empty.</p>;
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p._id} p={p} />
      ))}
    </div>
  );
}
