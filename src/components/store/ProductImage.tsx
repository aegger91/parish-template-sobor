import { IllustrationTile } from "@/components/sacred/Ornaments";
import type { PictogramName } from "@/components/sacred/Pictograms";
import { tr } from "@/lib/i18n";
import { withBase } from "@/lib/pages";
import type { ProductImage as Img } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductImage({ image, lang, className, large }: { image?: Img; lang: string; className?: string; large?: boolean }) {
  if (!image) return <IllustrationTile name="church" className={className} />;
  if (image.kind === "photo") {
    const src = large ? image.src : image.src.replace(/\.jpg$/, "-sm.jpg");
    return (
      <div className={cn("overflow-hidden bg-green-900", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={withBase(src)} alt={tr(image.alt, lang)} loading="lazy" className="size-full object-cover" />
      </div>
    );
  }
  return <IllustrationTile name={image.id as PictogramName} className={className} label={tr(image.alt, lang)} />;
}
