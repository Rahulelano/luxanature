import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { api, type Settings } from "@/lib/api";
import { Card, Field, ImageInput, Toggle, btnGhost, btnPrimary, inputCls } from "./ui";

/** Every piece of site wording the admin can override, grouped by page section. */
export const TEXT_KEYS: { group: string; items: { key: string; label: string; def: string; long?: boolean }[] }[] = [
  {
    group: "Hero (top of home page)",
    items: [
      { key: "hero.eyebrow", label: "Small heading", def: "Luxury Wellness, Sourced From Nature" },
      { key: "hero.title1", label: "Title line 1", def: "Nature. Quality." },
      { key: "hero.title2", label: "Title line 2 (gold)", def: "Everyday Wellness." },
      { key: "hero.subtitle", label: "Paragraph", long: true, def: "Raw wild honey, botanical nutrition and cold-pressed skincare — crafted in small batches from single-origin groves, for a ritual you can feel every single day." },
      { key: "hero.cta1", label: "Button 1", def: "Shop Now" },
      { key: "hero.cta2", label: "Button 2", def: "Explore Products" },
    ],
  },
  {
    group: "Our Story",
    items: [
      { key: "story.eyebrow", label: "Small heading", def: "Our Story" },
      { key: "story.title", label: "Title", def: "A quiet obsession with" },
      { key: "story.titleAccent", label: "Title (gold word)", def: "purity" },
      { key: "story.p1", label: "Paragraph 1", long: true, def: "Luxa Naturals began with a single hive and a simple belief: wellness should taste, feel and smell exactly like the place it came from. We work directly with beekeepers, herb growers and cold-press artisans — no fillers, no shortcuts, no compromise." },
      { key: "story.p2", label: "Paragraph 2", long: true, def: "Every jar, capsule and serum is traceable to its grove and tested for purity before it earns our gold seal." },
    ],
  },
  {
    group: "Home sections",
    items: [
      { key: "categories.eyebrow", label: "Categories – small heading", def: "Collections" },
      { key: "categories.title", label: "Categories – title", def: "Three rituals, one standard" },
      { key: "featured.eyebrow", label: "Featured – small heading", def: "Featured Collection" },
      { key: "featured.title", label: "Featured – title", def: "Crafted in small batches" },
      { key: "why.eyebrow", label: "Why us – small heading", def: "Why Luxa Naturals" },
      { key: "why.title", label: "Why us – title", def: "Built on trust, not trends" },
      { key: "best.eyebrow", label: "Best sellers – small heading", def: "Loved By Thousands" },
      { key: "best.title", label: "Best sellers – title", def: "Best Sellers" },
      { key: "ingredients.eyebrow", label: "Ingredients – small heading", def: "Inside Every Bottle" },
      { key: "ingredients.title", label: "Ingredients – title", def: "Ingredients you can trace" },
      { key: "reviews.title", label: "Testimonials – title", def: "Loved in 18,000+ homes" },
      { key: "journal.title", label: "Blog – title", def: "Notes from the grove" },
      { key: "newsletter.eyebrow", label: "Newsletter – small heading", def: "Join The Ritual" },
      { key: "newsletter.title", label: "Newsletter – title", def: "10% off your first ritual box" },
      { key: "newsletter.subtitle", label: "Newsletter – text", long: true, def: "Seasonal harvest notes, early access to small-batch launches, and members-only offers." },
      { key: "footer.rights", label: "Footer – rights text", def: "All Rights Reserved." },
    ],
  },
];

type Section = "brand" | "wording" | "contact" | "payments";

export function SettingsAdmin({ section }: { section: Section }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => api<{ settings: Settings }>("/admin/settings").then((r) => r.settings),
  });
  const [s, setS] = useState<Settings | null>(null);
  const [secret, setSecret] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setS(data);
  }, [data]);

  if (!s) return <p className="text-charcoal/50">Loading…</p>;
  const set = (patch: Partial<Settings>) => setS({ ...s, ...patch });

  const save = async () => {
    setSaving(true);
    try {
      const body: any = { ...s };
      if (secret) body.razorpayKeySecret = secret;
      if (webhookSecret) body.razorpayWebhookSecret = webhookSecret;
      await api("/admin/settings", { method: "PUT", body });
      setSecret("");
      setWebhookSecret("");
      toast.success("Settings saved — live on the site now");
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      qc.invalidateQueries({ queryKey: ["settings"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const saveBar = (
    <div className="sticky bottom-0 mt-6 flex justify-end border-t border-charcoal/10 bg-[#f7f6f1] py-4">
      <button className={btnPrimary} disabled={saving} onClick={save}>
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );

  if (section === "brand") {
    return (
      <>
        <Card title="Branding">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Business name">
              <input className={inputCls} value={s.businessName} onChange={(e) => set({ businessName: e.target.value })} />
            </Field>
            <Field label="Tagline">
              <input className={inputCls} value={s.tagline} onChange={(e) => set({ tagline: e.target.value })} />
            </Field>
            <Field label="Logo" hint="PNG with transparent background works best">
              <ImageInput value={s.logo} onChange={(v) => set({ logo: v || "/logo.png" })} />
            </Field>
            <Field label="Favicon (browser tab icon)">
              <ImageInput value={s.favicon} onChange={(v) => set({ favicon: v || "/logo.png" })} />
            </Field>
            <Field label="Home hero background image" hint="Leave empty to use the default image">
              <ImageInput value={s.heroImage} onChange={(v) => set({ heroImage: v })} />
            </Field>
            <Field label="Announcement bar" hint="Shown above the header on every page. Empty = hidden.">
              <input className={inputCls} value={s.announcement} onChange={(e) => set({ announcement: e.target.value })} placeholder="Free shipping above ₹999!" />
            </Field>
          </div>
        </Card>
        {saveBar}
      </>
    );
  }

  if (section === "wording") {
    return (
      <>
        <div className="space-y-6">
          {TEXT_KEYS.map((g) => (
            <Card key={g.group} title={g.group}>
              <div className="grid gap-4 md:grid-cols-2">
                {g.items.map((it) => (
                  <div key={it.key} className={it.long ? "md:col-span-2" : ""}>
                    <Field label={it.label} hint={s.texts[it.key] ? undefined : "Using default text"}>
                      {it.long ? (
                        <textarea
                          className={inputCls}
                          rows={3}
                          placeholder={it.def}
                          value={s.texts[it.key] ?? ""}
                          onChange={(e) => set({ texts: { ...s.texts, [it.key]: e.target.value } })}
                        />
                      ) : (
                        <input
                          className={inputCls}
                          placeholder={it.def}
                          value={s.texts[it.key] ?? ""}
                          onChange={(e) => set({ texts: { ...s.texts, [it.key]: e.target.value } })}
                        />
                      )}
                    </Field>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
        {saveBar}
      </>
    );
  }

  if (section === "contact") {
    return (
      <>
        <Card title="Contact & Social">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Contact email">
              <input className={inputCls} value={s.contactEmail} onChange={(e) => set({ contactEmail: e.target.value })} />
            </Field>
            <Field label="Phone">
              <input className={inputCls} value={s.contactPhone} onChange={(e) => set({ contactPhone: e.target.value })} />
            </Field>
            <Field label="WhatsApp number">
              <input className={inputCls} value={s.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} />
            </Field>
            <Field label="Address">
              <input className={inputCls} value={s.address} onChange={(e) => set({ address: e.target.value })} />
            </Field>
            <Field label="Instagram URL">
              <input className={inputCls} value={s.social?.instagram ?? ""} onChange={(e) => set({ social: { ...s.social, instagram: e.target.value } })} />
            </Field>
            <Field label="Facebook URL">
              <input className={inputCls} value={s.social?.facebook ?? ""} onChange={(e) => set({ social: { ...s.social, facebook: e.target.value } })} />
            </Field>
            <Field label="YouTube URL">
              <input className={inputCls} value={s.social?.youtube ?? ""} onChange={(e) => set({ social: { ...s.social, youtube: e.target.value } })} />
            </Field>
          </div>
        </Card>
        {saveBar}
      </>
    );
  }

  // payments
  const testKeys = async () => {
    try {
      const r = await api<{ mode: string }>("/admin/settings/test-razorpay", { method: "POST" });
      toast.success(`Razorpay keys work ✔ (${r.mode} mode)`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <Card title="Razorpay">
          <div className="space-y-5">
            <Toggle checked={s.razorpayEnabled} onChange={(v) => set({ razorpayEnabled: v })} label="Accept online payments (UPI / Cards / Netbanking)" />
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Key ID" hint="Razorpay Dashboard → Account & Settings → API Keys. Starts with rzp_test_ or rzp_live_">
                <input className={inputCls} value={s.razorpayKeyId} onChange={(e) => set({ razorpayKeyId: e.target.value })} placeholder="rzp_test_xxxxxxxx" />
              </Field>
              <Field label="Key Secret" hint={s.hasRazorpaySecret ? "A secret is saved. Leave empty to keep it." : "Required — stored only on the server, never shown again"}>
                <div className="relative">
                  <input type="password" className={inputCls} value={secret} onChange={(e) => setSecret(e.target.value)} placeholder={s.hasRazorpaySecret ? "••••••••••••" : "Paste key secret"} />
                  {s.hasRazorpaySecret && <CheckCircle2 className="absolute right-3 top-2.5 size-4 text-olive" />}
                </div>
              </Field>
              <Field
                label="Webhook secret (optional, recommended)"
                hint={`Razorpay → Webhooks → URL: ${window.location.origin}/api/payments/webhook · Event: payment.captured`}
              >
                <input type="password" className={inputCls} value={webhookSecret} onChange={(e) => setWebhookSecret(e.target.value)} placeholder={s.hasWebhookSecret ? "•••••••• (saved)" : "Webhook secret"} />
              </Field>
            </div>
            <button type="button" className={btnGhost} onClick={testKeys}>Test saved keys</button>
            <p className="text-xs text-charcoal/50">Save first, then test. Use test keys until you're ready to go live.</p>
          </div>
        </Card>
        <Card title="Shipping & COD">
          <div className="grid gap-5 md:grid-cols-3">
            <Field label="Shipping fee (₹)">
              <input type="number" min={0} className={inputCls} value={s.shippingFee} onChange={(e) => set({ shippingFee: Number(e.target.value) })} />
            </Field>
            <Field label="Free shipping above (₹)" hint="0 = never free">
              <input type="number" min={0} className={inputCls} value={s.freeShippingAbove} onChange={(e) => set({ freeShippingAbove: Number(e.target.value) })} />
            </Field>
            <div className="pt-6">
              <Toggle checked={s.codEnabled} onChange={(v) => set({ codEnabled: v })} label="Allow Cash on Delivery" />
            </div>
          </div>
        </Card>
      </div>
      {saveBar}
    </>
  );
}
