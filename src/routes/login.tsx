import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { api, type User } from "@/lib/api";
import { useAuth, useSettings } from "@/lib/store";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string } =>
    typeof s["redirect"] === "string" && s["redirect"].startsWith("/") ? { redirect: s["redirect"] } : {},
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { settings } = useSettings();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const requestOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    try {
      await api("/auth/request-otp", { body: { email } });
      setStep("otp");
      setCode("");
      toast.success(`Code sent to ${email}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async (value = code) => {
    if (value.length !== 6) return;
    setBusy(true);
    try {
      const r = await api<{ user: User }>("/auth/verify-otp", { body: { email, code: value } });
      setUser(r.user);
      toast.success("Welcome!");
      navigate({ to: redirect || (r.user.role === "admin" ? "/admin" : "/account") });
    } catch (err: any) {
      toast.error(err.message);
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pt-40 pb-24 px-6 min-h-[80vh]">
      <div className="mx-auto max-w-md bg-cream rounded-3xl p-10 shadow-luxe text-charcoal">
        <h1 className="font-display text-3xl text-forest text-center">Login to {settings.businessName}</h1>
        <p className="mt-3 text-center text-sm text-charcoal/60">
          {step === "email" ? "Enter your email — we'll send you a 6-digit code." : `Enter the code we sent to ${email}`}
        </p>

        {step === "email" ? (
          <form onSubmit={requestOtp} className="mt-8 space-y-4">
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white border border-gold/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-olive"
            />
            <button disabled={busy} className="w-full bg-forest text-cream py-3 rounded-full text-xs font-semibold tracking-widest uppercase hover:bg-olive disabled:opacity-60">
              {busy ? "Sending…" : "Send Code"}
            </button>
          </form>
        ) : (
          <div className="mt-8 flex flex-col items-center gap-6">
            <InputOTP
              maxLength={6}
              value={code}
              autoFocus
              onChange={(v) => {
                setCode(v);
                if (v.length === 6) verify(v);
              }}
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} className="bg-white size-12 text-lg" />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <button
              disabled={busy || code.length !== 6}
              onClick={() => verify()}
              className="w-full bg-forest text-cream py-3 rounded-full text-xs font-semibold tracking-widest uppercase hover:bg-olive disabled:opacity-60"
            >
              {busy ? "Verifying…" : "Verify & Login"}
            </button>
            <div className="flex justify-between w-full text-xs">
              <button onClick={() => setStep("email")} className="text-charcoal/60 hover:text-gold">← Change email</button>
              <button onClick={() => requestOtp()} disabled={busy} className="text-olive hover:text-gold">Resend code</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
