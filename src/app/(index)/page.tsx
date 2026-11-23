import { SealMark } from "@/components/brand/Logo";
import { site } from "@/lib/content";
import { defaultLang, languages, t, tr } from "@/lib/i18n";

/** Root entry: sends visitors to their saved or browser language, with a plain chooser as fallback. */
export default function IndexPage() {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const codes = languages.map((l) => l.code);
  const script = `(function(){try{var c=${JSON.stringify(codes)},d=${JSON.stringify(defaultLang)};var s=localStorage.getItem("sobor-lang");var pick=c.indexOf(s)>-1?s:null;if(!pick){var n=(navigator.languages||[navigator.language||""]);for(var i=0;i<n.length&&!pick;i++){var p=String(n[i]).toLowerCase().split("-")[0];if(c.indexOf(p)>-1)pick=p;}}location.replace(${JSON.stringify(base)}+"/"+(pick||d)+"/");}catch(e){location.replace(${JSON.stringify(base)}+"/"+${JSON.stringify(defaultLang)}+"/");}})();`;
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center text-cream-50">
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <SealMark lang={defaultLang} size={120} />
      <h1 className="vyaz-title text-4xl">{tr(site.name, defaultLang)}</h1>
      <nav aria-label={t("langPicker.title", defaultLang)} className="flex flex-wrap justify-center gap-3">
        {languages.map((l) => (
          <a
            key={l.code}
            href={`${base}/${l.code}/`}
            lang={l.code}
            className="rounded border border-gold-500/60 px-5 py-2 font-heading text-lg text-gold-200 hover:bg-green-800"
          >
            {l.label}
          </a>
        ))}
      </nav>
    </main>
  );
}
