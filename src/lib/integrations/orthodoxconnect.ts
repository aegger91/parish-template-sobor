import { site } from "../content";

/** Placeholder hooks for the OrthodoxConnect app. Every function resolves locally until wired up. */

export function connectDeepLink(path: "events/new" | "needs/new" | "events" | "needs" | `item/${string}`): string {
  const { appUrl, parishId } = site.orthodoxConnect;
  // TODO(orthodoxconnect): confirm the final deep-link format with the app team.
  return `${appUrl}/parish/${encodeURIComponent(parishId)}/${path}?source=website`;
}

export async function subscribeNewsletter(email: string): Promise<{ ok: boolean }> {
  // TODO(orthodoxconnect): POST to the newsletter endpoint with site.orthodoxConnect.newsletter.listId.
  await new Promise((r) => setTimeout(r, 500));
  return { ok: /.+@.+\..+/.test(email) };
}

export type SignupRequest = {
  itemId: string;
  kind: "event" | "need";
  name: string;
  email: string;
  guests?: number;
  waitlist?: boolean;
};

export async function signUpWithConnect(req: SignupRequest): Promise<{ ok: boolean; reference?: string }> {
  // TODO(orthodoxconnect): open the OrthodoxConnect sign-in, then call the RSVP or slot sign-up API
  // for site.orthodoxConnect.parishId with req.itemId. The app owns capacity and the signup count.
  await new Promise((r) => setTimeout(r, 600));
  if (!req.email) return { ok: false };
  return { ok: true, reference: `OC-${req.itemId}-${Date.now().toString(36)}` };
}
