import Stripe from "stripe";

export const DUMMY_STRIPE_SECRET_KEY = "sk_test_YOUR_STRIPE_SECRET_KEY";
export const DUMMY_STRIPE_WEBHOOK_SECRET = "whsec_YOUR_WEBHOOK_SECRET";
export const MOCK_CHECKOUT_SUCCESS_URL = "http://localhost:3001/dashboard?mock_success=true";

const PRODUCT_IDS = ["app1"] as const;

export type ProductId = (typeof PRODUCT_IDS)[number];

export interface CheckoutInput {
  userId: string;
  targetProduct: ProductId;
}

export type CheckoutInputResult =
  | { ok: true; input: CheckoutInput }
  | { ok: false; message: string };

export function isProductId(value: unknown): value is ProductId {
  return typeof value === "string" && PRODUCT_IDS.some((productId) => productId === value);
}

export function isStripeMockMode(): boolean {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  return !secretKey || secretKey === DUMMY_STRIPE_SECRET_KEY;
}

export function parseCheckoutInput(body: unknown): CheckoutInputResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, message: "リクエスト形式が不正です" };
  }

  const record = body as Record<string, unknown>;
  if (typeof record.userId !== "string" || record.userId.length === 0) {
    return { ok: false, message: "userId が必要です" };
  }
  if (!isProductId(record.targetProduct)) {
    return { ok: false, message: "targetProduct は app1 である必要があります" };
  }

  return {
    ok: true,
    input: {
      userId: record.userId,
      targetProduct: record.targetProduct,
    },
  };
}

export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey === DUMMY_STRIPE_SECRET_KEY) {
    throw new Error("Stripeの秘密鍵が未設定です");
  }
  return new Stripe(secretKey);
}

export function readPurchaseMetadata(
  session: Stripe.Checkout.Session,
): CheckoutInput | null {
  const userId = session.metadata?.userId ?? session.client_reference_id;
  const targetProduct = session.metadata?.targetProduct;
  if (!userId || !isProductId(targetProduct)) {
    return null;
  }
  return { userId, targetProduct };
}

export async function createStripeCheckoutUrl(input: CheckoutInput & { email: string }): Promise<string | null> {
  const stripe = getStripeClient();
  const hubUrl = process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: input.email,
    client_reference_id: input.userId,
    success_url: "http://localhost:3001/dashboard?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: hubUrl,
    metadata: {
      userId: input.userId,
      targetProduct: input.targetProduct,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "jpy",
          unit_amount: 9800,
          recurring: { interval: "month" },
          product_data: { name: "App1 Pro" },
        },
      },
    ],
  });

  return session.url;
}
