/** Placeholder form handlers. Replace with the builder's form endpoint or an email relay. */

export type ContactMessage = { name: string; email: string; phone?: string; subject: string; message: string };

export async function submitContactMessage(msg: ContactMessage): Promise<{ ok: boolean }> {
  // TODO(builder): send to the parish office inbox.
  await new Promise((r) => setTimeout(r, 600));
  return { ok: Boolean(msg.email && msg.message) };
}

export type ServiceRequest = {
  serviceId: string;
  routeTo: "priest" | "office";
  name: string;
  phone: string;
  email: string;
  preferredDate?: string;
  preferredTime?: string;
  notes?: string;
};

export async function submitServiceRequest(req: ServiceRequest): Promise<{ ok: boolean; reference?: string }> {
  // TODO(builder): route to the priest or the office according to req.routeTo.
  await new Promise((r) => setTimeout(r, 600));
  return { ok: Boolean(req.name && (req.phone || req.email)), reference: `REQ-${Date.now().toString(36).toUpperCase()}` };
}
