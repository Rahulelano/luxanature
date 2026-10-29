import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { api, inr, type Category, type Product } from "@/lib/api";
import { Card, Field, ImageInput, Toggle, btnDanger, btnGhost, btnPrimary, inputCls } from "./ui";

function useAllCategories() {
  return useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => api<{ categories: Category[] }>("/categories?all=1").then((r) => r.categories),
  });
}

function useInvalidateCatalog() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };
}

/* -------------------------------- Categories -------------------------------- */
type CatForm = { _id?: string; name: string; slug: string; description: string; image: string; parent: string; order: number; active: boolean };
const EMPTY_CAT: CatForm = { name: "", slug: "", description: "", image: "", parent: "", order: 0, active: true };

export function CategoriesAdmin() {
  const { data: cats = [] } = useAllCategories();
  const invalidate = useInvalidateCatalog();
  const [form, setForm] = useState<CatForm | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    try {
      const body = { ...form, parent: form.parent || null };
      if (form._id) await api(`/admin/categories/${form._id}`, { method: "PUT", body });
      else await api("/admin/categories", { body });
      toast.success("Category saved");
      setForm(null);
      invalidate();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const del = async (c: Category) => {
    if (!confirm(`Delete "${c.name}"?`)) return;
    try {
      await api(`/admin/categories/${c._id}`, { method: "DELETE" });
      toast.success("Deleted");
      invalidate();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const edit = (c: Category) =>
    setForm({ _id: c._id, name: c.name, slug: c.slug, description: c.description, image: c.image, parent: c.parent || "", order: c.order, active: c.active });

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <Card
          title="Categories & Subcategories"
          actions={
            <button className={btnPrimary} onClick={() => setForm({ ...EMPTY_CAT })}>
              <Plus className="size-4" /> Add
            </button>
          }
        >
          <div className="space-y-4">
            {cats.map((c) => (
              <div key={c._id} className="rounded-xl border border-charcoal/10">
                <div className="flex items-center gap-3 p-3">
                  {c.image ? <img src={c.image} alt="" className="size-10 rounded-lg object-cover" /> : <div className="size-10 rounded-lg bg-cream" />}
                  <div className="flex-1">
                    <p className="font-medium">
                      {c.name} {!c.active && <span className="text-xs text-red-500">(hidden)</span>}
                    </p>
                    <p className="text-xs text-charcoal/50">/{c.slug}</p>
                  </div>
                  <button className={btnGhost} onClick={() => setForm({ ...EMPTY_CAT, parent: c._id })} title="Add subcategory">
                    <Plus className="size-3.5" /> Sub
                  </button>
                  <button className={btnGhost} onClick={() => edit(c)} aria-label="Edit"><Pencil className="size-3.5" /></button>
                  <button className={btnDanger} onClick={() => del(c)} aria-label="Delete"><Trash2 className="size-3.5" /></button>
                </div>
                {(c.children?.length ?? 0) > 0 && (
                  <div className="border-t border-charcoal/10 bg-cream/40 px-3 py-2 space-y-1">
                    {c.children!.map((s) => (
                      <div key={s._id} className="flex items-center gap-3 py-1 pl-6 text-sm">
                        <span className="flex-1">
                          ↳ {s.name} {!s.active && <span className="text-xs text-red-500">(hidden)</span>}
                        </span>
                        <button className="text-olive" onClick={() => edit(s)} aria-label="Edit"><Pencil className="size-3.5" /></button>
                        <button className="text-red-500" onClick={() => del(s)} aria-label="Delete"><Trash2 className="size-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {cats.length === 0 && <p className="text-sm text-charcoal/50">No categories yet.</p>}
          </div>
        </Card>
      </div>

      {form && (
        <div className="lg:col-span-2">
          <Card title={form._id ? "Edit category" : form.parent ? "New subcategory" : "New category"}>
            <form onSubmit={save} className="space-y-4">
              <Field label="Name">
                <input className={inputCls} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="URL slug" hint="Leave empty to generate from the name">
                <input className={inputCls} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </Field>
              <Field label="Parent" hint="Choose a parent to make this a subcategory">
                <select className={inputCls} value={form.parent} onChange={(e) => setForm({ ...form, parent: e.target.value })}>
                  <option value="">— Top-level category —</option>
                  {cats.filter((c) => c._id !== form._id).map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Description">
                <textarea className={inputCls} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field>
              <Field label="Image">
                <ImageInput value={form.image} onChange={(v) => setForm({ ...form, image: v })} />
              </Field>
              <div className="flex items-center gap-6">
                <Field label="Sort order">
                  <input type="number" className={inputCls + " w-24"} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
                </Field>
                <Toggle checked={form.active} onChange={(v) => setForm({ ...form, active: v })} label="Visible on site" />
              </div>
              <div className="flex gap-3">
                <button className={btnPrimary}>Save</button>
                <button type="button" className={btnGhost} onClick={() => setForm(null)}>Cancel</button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

/* --------------------------------- Products --------------------------------- */
type ProdForm = Omit<Product, "_id" | "category" | "subcategory"> & { _id?: string; category: string; subcategory: string };
const EMPTY_PROD: ProdForm = {
  name: "", slug: "", description: "", ingredients: "", benefits: "", price: 0, mrp: 0, stock: 0, sku: "",
  category: "", subcategory: "", images: [], tag: "", featured: false, bestSeller: false, active: true, rating: 5, reviewsCount: 0,
};

export function ProductsAdmin() {
  const { data: cats = [] } = useAllCategories();
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products", q, catFilter],
    queryFn: () =>
      api<{ products: Product[] }>(`/admin/products?q=${encodeURIComponent(q)}&category=${catFilter}`).then((r) => r.products),
  });
  const invalidate = useInvalidateCatalog();
  const [form, setForm] = useState<ProdForm | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    if (!form.category) {
      toast.error("Choose a category");
      return;
    }
    try {
      const body = { ...form, subcategory: form.subcategory || null };
      if (form._id) await api(`/admin/products/${form._id}`, { method: "PUT", body });
      else await api("/admin/products", { body });
      toast.success("Product saved");
      setForm(null);
      invalidate();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const del = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    await api(`/admin/products/${p._id}`, { method: "DELETE" });
    toast.success("Deleted");
    invalidate();
  };

  if (form) {
    const subs = cats.find((c) => c._id === form.category)?.children ?? [];
    const set = (patch: Partial<ProdForm>) => setForm({ ...form, ...patch });
    return (
      <Card title={form._id ? `Edit: ${form.name}` : "New product"}>
        <form onSubmit={save} className="grid gap-5 md:grid-cols-2">
          <Field label="Product name">
            <input className={inputCls} required value={form.name} onChange={(e) => set({ name: e.target.value })} />
          </Field>
          <Field label="URL slug" hint="Leave empty to generate from the name">
            <input className={inputCls} value={form.slug} onChange={(e) => set({ slug: e.target.value })} />
          </Field>
          <Field label="Category">
            <select className={inputCls} required value={form.category} onChange={(e) => set({ category: e.target.value, subcategory: "" })}>
              <option value="">Choose…</option>
              {cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Subcategory">
            <select className={inputCls} value={form.subcategory} onChange={(e) => set({ subcategory: e.target.value })} disabled={subs.length === 0}>
              <option value="">— None —</option>
              {subs.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-3 gap-4 md:col-span-2">
            <Field label="Selling price (₹)">
              <input type="number" min={0} step="0.01" className={inputCls} required value={form.price} onChange={(e) => set({ price: Number(e.target.value) })} />
            </Field>
            <Field label="MRP (₹)" hint="Shown struck-through if higher">
              <input type="number" min={0} step="0.01" className={inputCls} value={form.mrp} onChange={(e) => set({ mrp: Number(e.target.value) })} />
            </Field>
            <Field label="Stock qty">
              <input type="number" min={0} className={inputCls} value={form.stock} onChange={(e) => set({ stock: Number(e.target.value) })} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Images" hint="First image is the main image. Max 5 MB each.">
              <ImageInput multiple value={form.images} onChange={(v) => set({ images: v })} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Description">
              <textarea className={inputCls} rows={4} value={form.description} onChange={(e) => set({ description: e.target.value })} />
            </Field>
          </div>
          <Field label="Key ingredients">
            <textarea className={inputCls} rows={3} value={form.ingredients} onChange={(e) => set({ ingredients: e.target.value })} />
          </Field>
          <Field label="Benefits">
            <textarea className={inputCls} rows={3} value={form.benefits} onChange={(e) => set({ benefits: e.target.value })} />
          </Field>
          <Field label="Badge / tag" hint='e.g. "New", "Best Seller", "Limited"'>
            <input className={inputCls} value={form.tag} onChange={(e) => set({ tag: e.target.value })} />
          </Field>
          <Field label="SKU">
            <input className={inputCls} value={form.sku} onChange={(e) => set({ sku: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Rating (0–5)">
              <input type="number" min={0} max={5} step="0.1" className={inputCls} value={form.rating} onChange={(e) => set({ rating: Number(e.target.value) })} />
            </Field>
            <Field label="Review count">
              <input type="number" min={0} className={inputCls} value={form.reviewsCount} onChange={(e) => set({ reviewsCount: Number(e.target.value) })} />
            </Field>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Toggle checked={form.active} onChange={(v) => set({ active: v })} label="Visible" />
            <Toggle checked={form.featured} onChange={(v) => set({ featured: v })} label="Featured (home)" />
            <Toggle checked={form.bestSeller} onChange={(v) => set({ bestSeller: v })} label="Best seller" />
          </div>
          <div className="flex gap-3 md:col-span-2">
            <button className={btnPrimary}>Save product</button>
            <button type="button" className={btnGhost} onClick={() => setForm(null)}>Cancel</button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card
      title="Products"
      actions={
        <button className={btnPrimary} onClick={() => setForm({ ...EMPTY_PROD })}>
          <Plus className="size-4" /> Add product
        </button>
      }
    >
      <div className="mb-4 flex flex-wrap gap-3">
        <input className={inputCls + " max-w-xs"} placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={inputCls + " max-w-xs"} value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="">All categories</option>
          {cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-charcoal/50">
            <tr>
              <th className="py-2">Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="py-6 text-charcoal/50">Loading…</td></tr>}
            {products.map((p) => (
              <tr key={p._id} className="border-t border-charcoal/10">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.images[0]} alt="" className="size-10 rounded-lg object-cover bg-cream" />
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="text-charcoal/70">
                  {p.category?.name}
                  {p.subcategory && <span className="block text-xs text-charcoal/45">{p.subcategory.name}</span>}
                </td>
                <td>{inr(p.price)}</td>
                <td className={p.stock <= 5 ? "font-semibold text-red-600" : ""}>{p.stock}</td>
                <td className="text-xs">
                  {p.active ? <span className="text-olive">Live</span> : <span className="text-charcoal/40">Hidden</span>}
                  {p.featured && <span className="ml-2 text-gold">★</span>}
                </td>
                <td className="text-right whitespace-nowrap">
                  <button
                    className={btnGhost}
                    onClick={() => setForm({ ...p, category: p.category?._id ?? "", subcategory: p.subcategory?._id ?? "" })}
                    aria-label="Edit"
                  >
                    <Pencil className="size-3.5" />
                  </button>{" "}
                  <button className={btnDanger} onClick={() => del(p)} aria-label="Delete"><Trash2 className="size-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && products.length === 0 && <p className="py-6 text-sm text-charcoal/50">No products.</p>}
      </div>
    </Card>
  );
}
