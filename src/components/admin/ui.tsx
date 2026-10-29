import { useRef, useState, type ReactNode } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { uploadImages } from "@/lib/api";

export const inputCls =
  "w-full rounded-lg border border-charcoal/15 bg-white px-3 py-2 text-sm focus:border-olive focus:outline-none focus:ring-1 focus:ring-olive";
export const btn = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60";
export const btnPrimary = `${btn} bg-forest text-cream hover:bg-olive`;
export const btnGhost = `${btn} border border-charcoal/15 bg-white hover:bg-cream`;
export const btnDanger = `${btn} border border-red-200 bg-white text-red-600 hover:bg-red-50`;

export function Field({ label, hint, children }: { label: string; hint?: string | undefined; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">{label}</span>
      {children}
      {hint && <span className="block text-xs text-charcoal/45">{hint}</span>}
    </label>
  );
}

export function Card({ title, children, actions }: { title?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm">
      {(title || actions) && (
        <div className="mb-5 flex items-center justify-between gap-4">
          {title && <h2 className="font-display text-xl text-forest">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-olive" : "bg-charcoal/20"}`}
      >
        <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
      {label}
    </label>
  );
}

/** Uploads to /api/admin/upload (saved in the server's uploads/ folder). */
export function ImageInput({
  value,
  onChange,
  multiple = false,
}: {
  value: string | string[];
  onChange: (v: any) => void;
  multiple?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const list = (Array.isArray(value) ? value : value ? [value] : []).filter(Boolean);

  const pick = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const urls = await uploadImages(files);
      onChange(multiple ? [...list, ...urls] : urls[0]);
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  const remove = (url: string) => onChange(multiple ? list.filter((u) => u !== url) : "");

  return (
    <div className="flex flex-wrap items-center gap-3">
      {list.map((url, i) => (
        <div key={url + i} className="group relative size-20 overflow-hidden rounded-lg border border-charcoal/10 bg-cream">
          <img src={url} alt="" className="size-full object-cover" />
          <button
            type="button"
            onClick={() => remove(url)}
            className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-charcoal/70 text-white opacity-0 group-hover:opacity-100"
            aria-label="Remove image"
          >
            <X className="size-3" />
          </button>
          {multiple && i === 0 && <span className="absolute bottom-0 inset-x-0 bg-olive/80 text-center text-[0.55rem] text-white">MAIN</span>}
        </div>
      ))}
      {(multiple || list.length === 0) && (
        <button
          type="button"
          disabled={busy}
          onClick={() => ref.current?.click()}
          className="grid size-20 place-items-center rounded-lg border-2 border-dashed border-charcoal/20 text-charcoal/50 hover:border-olive hover:text-olive"
        >
          {busy ? <span className="text-xs">…</span> : <Upload className="size-5" />}
        </button>
      )}
      {!multiple && list.length > 0 && (
        <button type="button" onClick={() => ref.current?.click()} className="text-xs text-olive hover:underline">
          Change
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" multiple={multiple} hidden onChange={(e) => pick(e.target.files)} />
    </div>
  );
}
