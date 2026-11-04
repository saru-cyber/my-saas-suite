import { getStripeClient } from "./stripe";

export async function createCustomerPortalUrl(email: string, returnUrl: string): Promise<string | null> {
  const stripe = getStripeClient();
  const listed = await stripe.customers.list({ email, limit: 1 });
  const customer = listed.data[0];
  if (!customer) {
    return null;
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: returnUrl,
  });
  return portalSession.url;
}
