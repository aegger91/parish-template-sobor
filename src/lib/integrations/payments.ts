import { site } from "../content";

/**
 * One provider-agnostic payment entry point shared by the store checkout,
 * donations and zapiski. Swap the body for a real provider when connecting the site.
 */
export type PaymentPurpose = "store-order" | "donation" | "commemoration";

export type PaymentLine = { id: string; label: string; quantity: number; unitAmount: number };

export type PaymentRequest = {
  purpose: PaymentPurpose;
  currency: string;
  amount: number;
  recurring?: "monthly";
  lines: PaymentLine[];
  payer: { name: string; email: string; phone?: string };
  fulfillment?: { method: "ship" | "pickup"; address?: Record<string, string> };
  metadata?: Record<string, string>;
};

export type PaymentResult =
  | { ok: true; reference: string; simulated: boolean }
  | { ok: false; error: string };

export async function submitPayment(request: PaymentRequest): Promise<PaymentResult> {
  switch (site.payments.provider) {
    case "stripe":
      // TODO(stripe): create a Checkout Session or PaymentIntent on the builder backend,
      // then redirect with stripe.redirectToCheckout / confirm with Stripe Elements.
      break;
    case "authorize-net":
      // TODO(authorize-net): tokenize card data with Accept.js, then post the opaque
      // data to the builder backend, which calls createTransactionRequest.
      break;
    case "none":
    default:
      break;
  }
  await new Promise((r) => setTimeout(r, 700));
  if (!request.payer.email || request.amount <= 0) return { ok: false, error: "invalid" };
  return { ok: true, reference: `SAMPLE-${Date.now().toString(36).toUpperCase()}`, simulated: true };
}
