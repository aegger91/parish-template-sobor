import siteJson from "@content/site.json";
import pagesJson from "@content/pages.json";
import scheduleJson from "@content/schedule.json";
import feastsJson from "@content/feasts.json";
import clergyJson from "@content/clergy.json";
import historyJson from "@content/history.json";
import galleryJson from "@content/gallery.json";
import newsJson from "@content/news.json";
import sermonsJson from "@content/sermons.json";
import storeJson from "@content/store.json";
import servicesJson from "@content/parish-services.json";
import zapiskiJson from "@content/zapiski.json";
import connectJson from "@content/connect.json";
import sourcesJson from "@content/image-sources.json";
import type {
  Clergy, ConnectFile, FeastsFile, GalleryItem, HistoryEvent, L, NewsItem, PagesFile,
  ParishServiceItem, ScheduleFile, Sermon, SiteConfig, StoreFile, ZapiskiConfig,
} from "./types";

export const site = siteJson as unknown as SiteConfig;
export const pagesFile = pagesJson as unknown as PagesFile;
export const schedule = scheduleJson as unknown as ScheduleFile;
export const feasts = feastsJson as unknown as FeastsFile;
export const clergy = (clergyJson as unknown as { clergy: Clergy[] }).clergy;
export const historyEvents = (historyJson as unknown as { events: HistoryEvent[] }).events;
export const gallery = galleryJson as unknown as { albums: { id: string; name: L }[]; items: GalleryItem[] };
export const news = newsJson as unknown as { categories: { id: string; name: L }[]; items: NewsItem[] };
export const sermons = (sermonsJson as unknown as { sermons: Sermon[] }).sermons;
export const store = storeJson as unknown as StoreFile;
export const parishServices = (servicesJson as unknown as { services: ParishServiceItem[] }).services;
export const zapiski = zapiskiJson as unknown as ZapiskiConfig;
export const connect = connectJson as unknown as ConnectFile;
export const imageSources = sourcesJson as unknown as {
  sources: { id: string; file: string; title: string; author: string; license: string; source: string; usedFor: string }[];
};

export const modules = site.modules;
