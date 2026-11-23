/** A translatable field: one entry per language code. Missing languages fall back to the default. */
export type L = Record<string, string>;

export type LanguageConfig = {
  code: string;
  label: string;
  shortLabel: string;
  locale: string;
  dir: "ltr" | "rtl";
};

export type CalendarStyle = "julian" | "revised-julian" | "gregorian";
export type LogoStyle = "seal" | "kiot" | "square" | "wordmark";

export type SiteConfig = {
  $schema?: string;
  id: string;
  sampleNotice: L;
  name: L;
  shortName: L;
  tagline: L;
  jurisdiction: L;
  languages: LanguageConfig[];
  defaultLanguage: string;
  timeZone: string;
  calendar: CalendarStyle;
  weekStartsOn: 0 | 1;
  currency: string;
  logo: { style: LogoStyle; ringText?: L; image?: string; imageAlt?: L };
  contact: {
    address: { line1: string; line2?: string; city: string; region: string; postalCode: string; country: string };
    phone: string;
    email: string;
    officeHours: L;
    directions: { id: string; title: L; body: L }[];
    parking: L;
    mapEmbedUrl?: string;
    directionsUrl?: string;
  };
  socials: { id: string; label: string; url: string; kind: "facebook" | "youtube" | "instagram" | "email" | "other" }[];
  modules: {
    livestream: boolean;
    store: boolean;
    requestService: boolean;
    zapiski: boolean;
    getInvolved: boolean;
  };
  livestream: { status: "auto" | "live" | "offline"; embedUrl?: string; watchUrl?: string; provider: L };
  orthodoxConnect: {
    enabled: boolean;
    parishId: string;
    appUrl: string;
    newsletter: { enabled: boolean; listId: string };
  };
  payments: { provider: "none" | "stripe" | "authorize-net"; testMode: boolean };
  donations: {
    oneTimeAmounts: number[];
    monthlyAmounts: number[];
    defaultAmount: number;
    funds: { id: string; label: L }[];
  };
  hero: {
    image: string;
    imageAlt: L;
    title: L;
    subtitle: L;
    ctas: { id: string; label: L; href: string; variant: "primary" | "secondary" }[];
    showCommemorationShortcut: boolean;
  };
  demo: { anchorDate: string; shiftDates: boolean };
};

export type Section = {
  id: string;
  type: string;
  enabled: boolean;
  title?: L;
  intro?: L;
  stickyHeader?: boolean;
  props?: Record<string, unknown>;
};

export type PageNode = {
  id: string;
  slug: string;
  title: L;
  navTitle?: L;
  description?: L;
  /** Optional pictogram for cards that link to this page (see Pictograms.tsx for names). */
  icon?: string;
  enabled: boolean;
  showInNav: boolean;
  requiresModule?: keyof SiteConfig["modules"];
  navGroupOnly?: boolean;
  collection?: "news" | "products";
  sections: Section[];
  children?: PageNode[];
};

export type PagesFile = { $schema?: string; pages: PageNode[] };

export type ServiceKind =
  | "vigil" | "vespers" | "matins" | "hours" | "liturgy" | "akathist"
  | "moleben" | "panikhida" | "confession" | "other";

export type RecurringService = {
  id: string;
  weekday: number;
  time: string;
  durationMinutes: number;
  kind: ServiceKind;
  title: L;
  note?: L;
  streamed: boolean;
};

export type DatedService = Omit<RecurringService, "weekday"> & { date: string };

export type FeastRule = {
  id: string;
  rank: FeastRank;
  eve?: FeastRuleService;
  day?: FeastRuleService;
};

export type FeastRuleService = {
  time: string;
  durationMinutes: number;
  kind: ServiceKind;
  title: L;
  streamed: boolean;
  suppress: ServiceKind[];
};

export type ScheduleFile = {
  $schema?: string;
  recurring: RecurringService[];
  dated: DatedService[];
  feastRules: FeastRule[];
};

export type FeastRank = "pascha" | "great" | "major" | "minor";

export type Feast = {
  id: string;
  rank: FeastRank;
  name: L;
  month?: number;
  day?: number;
  paschaOffset?: number;
  /** Set to false for days whose services the generic feast rules must not generate (Holy Week). */
  useServiceRule?: boolean;
};

export type FeastsFile = { $schema?: string; fixed: Feast[]; movable: Feast[]; weekdays: L[] };

export type Clergy = {
  id: string;
  name: L;
  role: L;
  shortBio: L;
  bio: L;
  email?: string;
  initials: string;
  /** Optional portrait. Without one, a monogram medallion is shown. */
  photo?: string;
};

export type HistoryEvent = { id: string; year: string; title: L; body: L; image?: string };

export type GalleryItem = {
  id: string;
  src: string;
  thumb: string;
  album: string;
  caption: L;
  credit: string;
  width: number;
  height: number;
};

export type NewsItem = {
  id: string;
  slug: string;
  date: string;
  category: string;
  title: L;
  excerpt: L;
  body: L;
  image?: string;
};

export type Sermon = {
  id: string;
  date: string;
  type: "audio" | "video" | "text";
  title: L;
  preacher: L;
  scripture: L;
  summary: L;
  text?: L;
  mediaUrl?: string;
  durationMinutes?: number;
};

export type ProductImage =
  | { kind: "photo"; src: string; alt: L }
  | { kind: "illustration"; id: string; alt: L };

export type Product = {
  id: string;
  slug: string;
  category: string;
  name: L;
  summary: L;
  description: L;
  images: ProductImage[];
  pickupOnly?: boolean;
  variants: { id: string; label: L; price: number; stock: number; sku: string }[];
};

export type StoreFile = {
  $schema?: string;
  categories: { id: string; name: L }[];
  shipping: { flatRate: number; freeOver: number; pickupNote: L };
  products: Product[];
};

export type ParishServiceItem = {
  id: string;
  illustration: string;
  title: L;
  subtitle?: L;
  description: L;
  price: { kind: "free" | "donation"; suggested?: number };
  duration: L;
  routeTo: "priest" | "office";
  action: "form" | "link";
  href?: string;
};

export type ZapiskiConfig = {
  $schema?: string;
  maxNames: number;
  noteTypes: { id: "health" | "repose"; label: L; slipHeading: L }[];
  commemorations: {
    id: string;
    label: L;
    description?: L;
    suggestedDonation: number;
    appliesTo: ("health" | "repose")[];
  }[];
  prefixes: { id: string; label: L; slipText: L; appliesTo: ("health" | "repose")[] }[];
  candles: { id: string; label: L; price: number }[];
  retentionDays: number;
};

export type ConnectItem = {
  id: string;
  title: L;
  date: string;
  time: string;
  endTime?: string;
  location: L;
  capacity: number;
  signups: number;
  organizer: L;
  category: string;
  description: L;
};

export type ConnectFile = {
  $schema?: string;
  eventCategories: { id: string; name: L }[];
  needCategories: { id: string; name: L }[];
  events: ConnectItem[];
  needs: ConnectItem[];
};
