"use client";

import { useState, type ReactElement } from "react";
import { Check, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrthodoxCross } from "@/components/sacred/OrthodoxCross";
import { isEmail } from "@/lib/hooks";
import { signUpWithConnect } from "@/lib/integrations/orthodoxconnect";
import { t, tr } from "@/lib/i18n";
import type { ConnectItem } from "@/lib/types";

export function SignupDialog({
  lang,
  item,
  kind,
  waitlist,
  trigger,
  onDone,
}: {
  lang: string;
  item: ConnectItem;
  kind: "event" | "need";
  waitlist: boolean;
  trigger: ReactElement;
  onDone: (count: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [guests, setGuests] = useState(1);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const left = Math.max(1, item.capacity - item.signups);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = { name: name.trim() ? undefined : t("form.errName", lang), email: isEmail(email) ? undefined : t("form.errEmail", lang) };
    setErrors(errs);
    if (errs.name || errs.email) return;
    setState("sending");
    const res = await signUpWithConnect({ itemId: item.id, kind, name, email, guests: kind === "event" ? guests : 1, waitlist });
    setState(res.ok ? "done" : "error");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o && state === "done") onDone(waitlist ? 0 : kind === "event" ? guests : 1);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent closeLabel={t("close", lang)} className="bg-cream-50 p-6 sm:max-w-md">
        <DialogHeader className="text-start">
          <p className="flex items-center gap-2 text-[0.85rem] text-green-700">
            <OrthodoxCross size={13} className="text-gold-600" /> {t("connect.badge", lang)}
          </p>
          <DialogTitle className="pe-8 text-[1.4rem] text-green-800">{t("connect.signInTitle", lang)}</DialogTitle>
          <DialogDescription className="text-ink-muted">
            <span className="block font-heading text-ink">{tr(item.title, lang)}</span>
            {t("connect.signInText", lang)}
          </DialogDescription>
        </DialogHeader>
        {state === "done" ? (
          <div className="space-y-4" role="status">
            <p className="flex items-start gap-2 rounded-md bg-green-100 p-3 text-green-800">
              <Check className="mt-1 size-4 shrink-0" aria-hidden /> {t("connect.done", lang)}
            </p>
            <button type="button" onClick={() => { setOpen(false); onDone(waitlist ? 0 : kind === "event" ? guests : 1); }} className="min-h-11 w-full rounded-full bg-green-800 font-button text-cream-50 hover:bg-green-700">
              {t("close", lang)}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor={`su-name-${item.id}`}>{t("form.name", lang)}</Label>
              <Input id={`su-name-${item.id}`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={!!errors.name} className="h-11 bg-white" />
              {errors.name ? <p className="text-[0.85rem] text-kinovar">{errors.name}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`su-email-${item.id}`}>{t("form.email", lang)}</Label>
              <Input id={`su-email-${item.id}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" aria-invalid={!!errors.email} className="h-11 bg-white" />
              {errors.email ? <p className="text-[0.85rem] text-kinovar">{errors.email}</p> : null}
            </div>
            {kind === "event" && !waitlist ? (
              <div className="space-y-1.5">
                <Label htmlFor={`su-guests-${item.id}`}>{t("connect.guests", lang)}</Label>
                <Input id={`su-guests-${item.id}`} type="number" min={1} max={Math.min(10, left)} value={guests} onChange={(e) => setGuests(Math.max(1, Math.min(Math.min(10, left), Number(e.target.value) || 1)))} className="h-11 w-28 bg-white" />
              </div>
            ) : null}
            {state === "error" ? <p className="text-[0.9rem] text-kinovar" role="alert">{t("error.generic", lang)}</p> : null}
            <button type="submit" disabled={state === "sending"} className="bell-hover inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-green-800 px-5 font-button text-cream-50 hover:bg-green-700 disabled:opacity-70">
              {state === "sending" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <OrthodoxCross size={14} className="text-gold-300" />}
              {state === "sending" ? t("sending", lang) : waitlist ? t("events.waitlist", lang) : t("connect.continue", lang)}
            </button>
            <p className="text-center text-[0.8rem] text-ink-muted">{t("sampleHandlerNote", lang)}</p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
