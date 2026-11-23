import { PageBanner } from "@/components/layout/PageBanner";
import { Paragraphs } from "@/components/sections/SectionShell";
import { ProductBuyBox } from "./ProductBuyBox";
import { ProductImage } from "./ProductImage";
import { store } from "@/lib/content";
import { tr } from "@/lib/i18n";
import type { ResolvedPage } from "@/lib/pages";
import type { Product } from "@/lib/types";

export function ProductDetail({ lang, product, parent, crumbs }: { lang: string; product: Product; parent: ResolvedPage; crumbs: ResolvedPage[] }) {
  const cat = store.categories.find((c) => c.id === product.category);
  return (
    <>
      <PageBanner lang={lang} page={parent} crumbs={crumbs} title={product.name} description={cat?.name ?? { en: "" }} />
      <section className="container-sobor grid gap-10 py-12 md:grid-cols-2 lg:gap-14 lg:py-16">
        <div className="space-y-3">
          <ProductImage image={product.images[0]} lang={lang} large className="aspect-square rounded-lg border-4 border-cream-50 shadow ring-1 ring-gold-500/40" />
          {product.images.length > 1 ? (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1).map((im, i) => (
                <ProductImage key={i} image={im} lang={lang} className="aspect-square rounded" />
              ))}
            </div>
          ) : null}
        </div>
        <div className="min-w-0">
          <p className="font-heading text-[1.2rem] leading-relaxed text-green-800">{tr(product.summary, lang)}</p>
          <ProductBuyBox lang={lang} product={product} />
          <Paragraphs text={tr(product.description, lang)} className="mt-8" />
        </div>
      </section>
    </>
  );
}
