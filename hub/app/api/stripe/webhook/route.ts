import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  DUMMY_STRIPE_WEBHOOK_SECRET,
  getStripeClient,
  isStripeMockMode,
  readPurchaseMetadata,
} from "../../../../src/billing/stripe";
import { grantProductAccess } from "../../../../src/db/users";

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

  const purchase = readPurchaseMetadata(event.data.object);
  if (!purchase) {
    return NextResponse.json(
      { ok: false, message: "Checkoutのmetadataが不足しています" },
      { status: 400 },
    );
  }

  const user = grantProductAccess(purchase.userId, purchase.targetProduct);
  if (!user) {
    return NextResponse.json({ ok: false, message: "ユーザーが見つかりません" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    userId: user.id,
    activeProducts: user.activeProducts,
    plan: user.plan,
  });
}
