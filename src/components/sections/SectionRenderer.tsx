import type { ComponentType } from "react";
import type { ResolvedPage } from "@/lib/pages";
import type { Section } from "@/lib/types";
import { site } from "@/lib/content";
import { Hero } from "./Hero";
import { Welcome, RichText, SubpageCards, ParishLife, DonateBand, Visit, Credits } from "./StaticSections";
import { NewsLatest } from "./NewsLatest";
import { NewsList } from "./NewsList";
import { WeekGlance } from "./WeekGlance";
import { Schedule } from "./Schedule";
import { ClergyGrid } from "./ClergyGrid";
import { Timeline } from "./Timeline";
import { Gallery } from "./Gallery";
import { Livestream, LivestreamTeaser } from "./Livestream";
import { Sermons } from "./Sermons";
import { Events, EventsPreview, Needs, NeedsPreview } from "@/components/connect/ConnectSections";
import { ServiceRequests } from "@/components/services/ServiceRequests";
import { Zapiski } from "@/components/zapiski/Zapiski";
import { StoreGrid } from "@/components/store/StoreGrid";
import { Cart } from "@/components/store/Cart";
import { Checkout } from "@/components/store/Checkout";
import { Donate } from "./Donate";
import { Contact } from "./Contact";

export type SectionProps = { lang: string; section: Section; page: ResolvedPage };

/** Section types available to pages.json. Add a type here to make it placeable on any page. */
const registry: Record<string, ComponentType<SectionProps>> = {
  hero: Hero,
  welcome: Welcome,
  "rich-text": RichText,
  "subpage-cards": SubpageCards,
  "parish-life": ParishLife,
  "news-latest": NewsLatest,
  "news-list": NewsList,
  "week-glance": WeekGlance,
  schedule: Schedule,
  "clergy-grid": ClergyGrid,
  timeline: Timeline,
  gallery: Gallery,
  livestream: Livestream,
  "livestream-teaser": LivestreamTeaser,
  sermons: Sermons,
  events: Events,
  "events-preview": EventsPreview,
  needs: Needs,
  "needs-preview": NeedsPreview,
  "service-requests": ServiceRequests,
  zapiski: Zapiski,
  store: StoreGrid,
  cart: Cart,
  checkout: Checkout,
  donate: Donate,
  "donate-band": DonateBand,
  contact: Contact,
  visit: Visit,
  credits: Credits,
};

export const sectionTypes = Object.keys(registry);

/** Sections that belong to an optional module disappear everywhere when that module is off. */
const sectionModule: Partial<Record<string, keyof typeof site.modules>> = {
  livestream: "livestream",
  "livestream-teaser": "livestream",
  sermons: "livestream",
  events: "getInvolved",
  "events-preview": "getInvolved",
  needs: "getInvolved",
  "needs-preview": "getInvolved",
  "service-requests": "requestService",
  zapiski: "zapiski",
  store: "store",
  cart: "store",
  checkout: "store",
};

export function SectionRenderer(props: SectionProps) {
  const mod = sectionModule[props.section.type];
  if (mod && !site.modules[mod]) return null;
  const Comp = registry[props.section.type];
  if (!Comp) {
    if (process.env.NODE_ENV !== "production") console.warn(`Unknown section type: ${props.section.type}`);
    return null;
  }
  return <Comp {...props} />;
}
