"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { subscribeNewsletter } from "@/lib/integrations/orthodoxconnect";
import { t } from "@/lib/i18n";
import { isEmail } from "@/lib/hooks";
import { SwingingBell } from "@/components/sacred/Pictograms";

export function Newsletter({ lang }: { lang: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [touched, setTouched] = useState(false);
  const invalid = touched && !isEmail(email);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!isEmail(email)) return;
    setState("busy");
    const r = await subscribeNewsletter(email);
    setState(r.ok ? "done" : "error");
  }

  if (state === "done") {
    return <p role="status" className="rounded border border-gold-500/40 bg-green-800/60 px-4 py-3 text-cream-50">{t("footer.subscribed", lang)}</p>;
  }

  return (
    <form onSubmit={submit} noValidate className="flex w-full flex-col gap-2 sm:flex-row sm:items-start">
      <div className="flex-1">
        <label htmlFor="newsletter-email" className="sr-only">{t("form.email", lang)}</label>
        <Input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={t("footer.emailPlaceholder", lang)}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? "newsletter-err" : undefined}
          className="h-11 border-gold-500/40 bg-cream-50 text-base text-ink"
        />
        {invalid ? <p id="newsletter-err" className="mt-1 text-sm text-gold-200">{t("form.errEmail", lang)}</p> : null}
        {state === "error" ? <p className="mt-1 text-sm text-gold-200">{t("error.generic", lang)}</p> : null}
      </div>
      <button
        type="submit"
        disabled={state === "busy"}
        className="bell-hover inline-flex h-11 items-center justify-center gap-2 rounded bg-gold-400 px-5 font-button text-green-950 hover:bg-gold-200 disabled:opacity-70"
      >
        {state === "busy" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <SwingingBell />}
        {t("footer.subscribe", lang)}
      </button>
    </form>
  );
}
