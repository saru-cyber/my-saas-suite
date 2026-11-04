import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  claimCompletedSession,
  fulfillPurchase,
  readPurchaseIntent,
  releaseCompletedSession,
} from "../../../../src/billing/fulfillment";
import {
  DUMMY_STRIPE_WEBHOOK_SECRET,
  getStripeClient,
  isStripeMockMode,
} from "../../../../src/billing/stripe";
import { recordAbTestEvent } from "../../../../src/commerce/store";

export const runtime = "nodejs";

interface WebhookSuccess {
  ok: true;
  skipped?: boolean;
  ignored?: boolean;
  userId?: string;
  activeProducts?: string[];
  plan?: string;
}

interface ErrorBody {
  ok: false;
  message: string;
}

export async function POST(request: Request): Promise<NextResponse<WebhookSuccess | ErrorBody>> {
  if (isStripeMockMode()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret || webhookSecret === DUMMY_STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, message: "Webhookの署名を確認できません" }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ ok: false, message: "Webhookの署名が無効です" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const session = event.data.object;
  const purchase = readPurchaseIntent(session);
  if (!purchase) {
    return NextResponse.json(
      { ok: false, message: "Checkoutのmetadataが不足しています" },
      { status: 400 },
    );
  }

  const firstDelivery = claimCompletedSession(session.id);
  const fulfilled = await fulfillPurchase(purchase);
  if (!fulfilled.ok) {
    if (firstDelivery) {
      releaseCompletedSession(session.id);
    }
    return NextResponse.json({ ok: false, message: fulfilled.message }, { status: fulfilled.status });
  }

  if (firstDelivery && purchase.abTestId && purchase.variant) {
    await recordAbTestEvent({
      testId: purchase.abTestId,
      userId: purchase.userId,
      variant: purchase.variant,
      eventType: "conversion",
      amountCents: session.amount_total,
    });
  }

  return NextResponse.json({
    ok: true,
    userId: fulfilled.user.id,
    activeProducts: fulfilled.user.activeProducts,
    plan: fulfilled.user.plan,
  });
}
