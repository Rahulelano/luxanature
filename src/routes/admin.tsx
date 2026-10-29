import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  LayoutDashboard, Package, FolderTree, ShoppingCart, Users, Palette, Type, Phone, CreditCard, ExternalLink, LogOut, Menu,
} from "lucide-react";
import { api, inr, STATUS_LABEL, type Order } from "@/lib/api";
import { useAuth, useSettings } from "@/lib/store";
import { Card, btnGhost, inputCls } from "@/components/admin/ui";
import { CategoriesAdmin, ProductsAdmin } from "@/components/admin/AdminCatalog";
import { SettingsAdmin } from "@/components/admin/AdminSettings";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "products", label: "Products", icon: Package },
  { id: "categories", label: "Categories", icon: FolderTree },
  { id: "customers", label: "Customers", icon: Users },
  { id: "brand", label: "Logo & Branding", icon: Palette },
  { id: "wording", label: "Site Wording", icon: Type },
  { id: "contact", label: "Contact & Social", icon: Phone },
  { id: "payments", label: "Payments & Shipping", icon: CreditCard },
] as const;
type Tab = (typeof TABS)[number]["id"];

export const Route = createFileRoute("/admin")({
  validateSearch: (s: Record<string, unknown>): { tab?: Tab } =>
    TABS.some((t) => t.id === s["tab"]) ? { tab: s["tab"] as Tab } : {},
  component: AdminPage,
});

function AdminPage() {
  const { tab = "dashboard" } = Route.useSearch();
  const { user, isLoading, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) navigate({ to: "/login", search: { redirect: "/admin" } });
  }, [isLoading, user]);

  if (isLoading || !user) return <div className="grid min-h-screen place-items-center text-charcoal/50">Loading…</div>;
  if (user.role !== "admin") {
    return (
      <div className="grid min-h-screen place-items-center text-center">
        <div>
          <h1 className="font-display text-3xl text-forest">Admins only</h1>
          <p className="mt-2 text-sm text-charcoal/60">{user.email} doesn't have admin access.</p>
          <Link to="/" className="mt-6 inline-block text-gold hover:underline">Back to site</Link>
        </div>
      </div>
    );
  }

  const current = TABS.find((t) => t.id === tab)!;

  return (
    <div className="min-h-screen bg-[#f7f6f1] text-charcoal lg:flex">
      <aside className={`${menuOpen ? "block" : "hidden"} lg:block w-full lg:w-64 shrink-0 bg-forest text-cream lg:min-h-screen lg:sticky lg:top-0`}>
        <div className="flex items-center gap-3 p-6 border-b border-cream/10">
          <img src={settings.logo} alt="" className="h-10 w-auto" />
          <div>
            <p className="font-display text-lg leading-tight">{settings.businessName}</p>
            <p className="text-[0.6rem] uppercase tracking-[0.25em] text-gold">Admin</p>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {TABS.map((t) => (
            <Link
              key={t.id}
              to="/admin"
              search={{ tab: t.id }}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors ${tab === t.id ? "bg-cream/15 text-gold" : "text-cream/80 hover:bg-cream/10"}`}
            >
              <t.icon className="size-4" /> {t.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-cream/10 space-y-1">
          <a href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-cream/80 hover:bg-cream/10">
            <ExternalLink className="size-4" /> View site
          </a>
          <button
            onClick={async () => {
              await logout();
              navigate({ to: "/" });
            }}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-cream/80 hover:bg-cream/10"
          >
            <LogOut className="size-4" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-6 lg:p-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="font-display text-3xl text-forest">{current.label}</h1>
          <button className={btnGhost + " lg:hidden"} onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            <Menu className="size-4" />
          </button>
          <span className="hidden text-xs text-charcoal/50 lg:block">{user.email}</span>
        </div>

        {tab === "dashboard" && <Dashboard />}
        {tab === "orders" && <OrdersAdmin />}
        {tab === "products" && <ProductsAdmin />}
        {tab === "categories" && <CategoriesAdmin />}
        {tab === "customers" && <CustomersAdmin />}
        {(tab === "brand" || tab === "wording" || tab === "contact" || tab === "payments") && <SettingsAdmin section={tab} />}
      </main>
    </div>
  );
}

/* --------------------------------- Dashboard -------------------------------- */
function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () =>
      api<{ products: number; users: number; orders: number; revenue: number; lowStock: { _id: string; name: string; stock: number }[]; recent: Order[] }>(
        "/admin/stats",
      ),
  });
  if (!data) return <p className="text-charcoal/50">Loading…</p>;
  const tiles = [
    ["Revenue", inr(data.revenue)],
    ["Orders", data.orders],
    ["Products", data.products],
    ["Customers", data.users],
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(([label, value]) => (
          <div key={label as string} className="rounded-2xl border border-charcoal/10 bg-white p-6">
            <p className="text-xs uppercase tracking-wider text-charcoal/50">{label}</p>
            <p className="mt-2 font-display text-3xl text-forest">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Recent orders">
            <OrderTable orders={data.recent} />
          </Card>
        </div>
        <Card title="Low stock (≤ 5)">
          {data.lowStock.length === 0 ? (
            <p className="text-sm text-charcoal/50">All good 👍</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {data.lowStock.map((p) => (
                <li key={p._id} className="flex justify-between">
                  <span>{p.name}</span>
                  <span className="font-semibold text-red-600">{p.stock}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function OrderTable({ orders, onOpen }: { orders: Order[]; onOpen?: (o: Order) => void }) {
  if (orders.length === 0) return <p className="text-sm text-charcoal/50">No orders yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wider text-charcoal/50">
          <tr>
            <th className="py-2">Order</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id} onClick={() => onOpen?.(o)} className={`border-t border-charcoal/10 ${onOpen ? "cursor-pointer hover:bg-cream/60" : ""}`}>
              <td className="py-3">
                <p className="font-medium">{o.orderNumber}</p>
                <p className="text-xs text-charcoal/45">{new Date(o.createdAt).toLocaleString("en-IN")}</p>
              </td>
              <td className="text-charcoal/70">{o.address?.fullName}<span className="block text-xs">{o.email}</span></td>
              <td>{inr(o.total)}</td>
              <td className="text-xs">
                {o.paymentMethod.toUpperCase()} · <span className={o.paymentStatus === "paid" ? "text-olive" : "text-charcoal/50"}>{o.paymentStatus}</span>
              </td>
              <td className="text-xs">{STATUS_LABEL[o.status]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------------------------- Orders ---------------------------------- */
function OrdersAdmin() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Order | null>(null);
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders", status, q],
    queryFn: () => api<{ orders: Order[] }>(`/admin/orders?status=${status}&q=${encodeURIComponent(q)}`).then((r) => r.orders),
  });

  const update = async (patch: Partial<Order>) => {
    if (!open) return;
    try {
      const r = await api<{ order: Order }>(`/admin/orders/${open._id}`, { method: "PUT", body: patch });
      setOpen(r.order);
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Order updated");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <div className={open ? "xl:col-span-3" : "xl:col-span-5"}>
        <Card>
          <div className="mb-4 flex flex-wrap gap-3">
            <input className={inputCls + " max-w-xs"} placeholder="Search order no. or email" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className={inputCls + " max-w-xs"} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <OrderTable orders={orders} onOpen={setOpen} />
        </Card>
      </div>

      {open && (
        <div className="xl:col-span-2">
          <Card title={open.orderNumber} actions={<button className="text-xs text-charcoal/50" onClick={() => setOpen(null)}>Close ✕</button>}>
            <div className="space-y-5 text-sm">
              <div className="space-y-2">
                {open.items.map((i) => (
                  <div key={i.product} className="flex items-center gap-3">
                    <img src={i.image} alt="" className="size-10 rounded object-cover" />
                    <span className="flex-1">{i.name} × {i.qty}</span>
                    <span>{inr(i.price * i.qty)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-charcoal/10 pt-2 text-xs text-charcoal/60"><span>Shipping</span><span>{inr(open.shipping)}</span></div>
                <div className="flex justify-between font-semibold"><span>Total</span><span>{inr(open.total)}</span></div>
              </div>
              <div className="rounded-lg bg-cream/60 p-3 text-xs leading-relaxed">
                <b>{open.address.fullName}</b> · {open.address.phone}
                <br />
                {open.address.line1}{open.address.line2 ? `, ${open.address.line2}` : ""}, {open.address.city}, {open.address.state} – {open.address.pincode}
                <br />
                {open.email}
              </div>
              <p className="text-xs">
                Payment: <b>{open.paymentMethod.toUpperCase()}</b> — {open.paymentStatus}
              </p>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">Order status</span>
                <select className={inputCls} value={open.status} onChange={(e) => update({ status: e.target.value as Order["status"] })}>
                  {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">Payment status</span>
                <select className={inputCls} value={open.paymentStatus} onChange={(e) => update({ paymentStatus: e.target.value as Order["paymentStatus"] })}>
                  {["pending", "paid", "failed", "refunded"].map((p) => <option key={p}>{p}</option>)}
                </select>
              </label>
              <TrackingInput key={open._id} initial={open.trackingNumber} onSave={(trackingNumber) => update({ trackingNumber })} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/60 mb-1">History</p>
                <ul className="space-y-1 text-xs text-charcoal/60">
                  {open.history.map((h, i) => (
                    <li key={i}>{new Date(h.at).toLocaleString("en-IN")} — {STATUS_LABEL[h.status as Order["status"]] ?? h.status}{h.note ? ` (${h.note})` : ""}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function TrackingInput({ initial, onSave }: { initial: string; onSave: (v: string) => void }) {
  const [v, setV] = useState(initial);
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">Tracking number</span>
      <div className="flex gap-2">
        <input className={inputCls} value={v} onChange={(e) => setV(e.target.value)} />
        <button className={btnGhost} onClick={() => onSave(v)} type="button">Save</button>
      </div>
    </label>
  );
}

/* --------------------------------- Customers -------------------------------- */
function CustomersAdmin() {
  const qc = useQueryClient();
  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api<{ users: any[] }>("/admin/users").then((r) => r.users),
  });
  const update = async (id: string, body: object) => {
    try {
      await api(`/admin/users/${id}`, { method: "PUT", body });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Updated");
    } catch (e: any) {
      toast.error(e.message);
    }
  };
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-charcoal/50">
            <tr><th className="py-2">Email</th><th>Name</th><th>Phone</th><th>Orders</th><th>Role</th><th>Joined</th><th /></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-charcoal/10">
                <td className="py-3">{u.email} {u.blocked && <span className="text-xs text-red-500">(blocked)</span>}</td>
                <td>{u.name || "—"}</td>
                <td>{u.phone || "—"}</td>
                <td>{u.orders}</td>
                <td>
                  <select className="rounded border border-charcoal/15 px-2 py-1 text-xs" value={u.role} onChange={(e) => update(u._id, { role: e.target.value })}>
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="text-xs text-charcoal/50">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                <td>
                  <button className="text-xs text-red-600 hover:underline" onClick={() => update(u._id, { blocked: !u.blocked })}>
                    {u.blocked ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
