import { NextResponse } from "next/server";
import { buildSessionCookie, readSessionFromRequest, signSession } from "../../../../src/auth/session";
import { claimCompletedSession, fulfillPurchase } from "../../../../src/billing/fulfillment";
import { createSubscriptionCheckoutUrl, isStripeMockMode } from "../../../../src/billing/stripe";
import { resolvePricingVariant } from "../../../../src/commerce/pricing";
import { recordAbTestEvent } from "../../../../src/commerce/store";
import { buildVisitorCookie, readOrCreateVisitorId } from "../../../../src/commerce/visitor";
import { sessionClaimsForUser } from "../../../../src/db/users";
import { readAuthSettings, sessionTtlSeconds } from "../../../../src/settings/store";

export const runtime = "nodejs";

interface CheckoutSuccess {
  ok: true;
  mock: boolean;
  url: string;
  entityType: "product" | "bundle";
  targetId: string;
  patternId: string;
  abTestId: string | null;
  variant: "A" | "B" | null;
}

interface ErrorBody {
  ok: false;
  message: string;
}

interface CheckoutBody {
  userId: string;
  targetId: string;
  locale: "en" | "ja";
}

function errorResponse(message: string, status: number): NextResponse<ErrorBody> {
  return NextResponse.json({ ok: false, message }, { status });
}

function parseBody(body: unknown): { ok: true; value: CheckoutBody } | { ok: false; message: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, message: "リクエスト形式が不正です" };
  }
  const record = body as Record<string, unknown>;
  if (typeof record.userId !== "string" || record.userId.trim().length === 0) {
    return { ok: false, message: "userId が必要です" };
  }
  if (typeof record.targetId !== "string" || record.targetId.trim().length === 0) {
    return { ok: false, message: "targetId が必要です" };
  }
  return {
    ok: true,
    value: {
      userId: record.userId.trim(),
      targetId: record.targetId.trim(),
      locale: record.locale === "ja" ? "ja" : "en",
    },
  };
}

function hubOrigin(): string {
  return process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:3000";
}

function withVisitorCookie<T>(response: NextResponse<T>, visitorId: string, created: boolean): NextResponse<T> {
  if (created) {
    response.headers.append("Set-Cookie", buildVisitorCookie(visitorId));
  }
  return response;
}

export async function POST(request: Request): Promise<NextResponse<CheckoutSuccess | ErrorBody>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("不正なJSONです", 400);
  }

  const parsed = parseBody(body);
  if (!parsed.ok) {
    return errorResponse(parsed.message, 400);
  }

  const session = readSessionFromRequest(request);
  if (!session) {
    return errorResponse("ログインが必要です", 401);
  }
  if (session.userId !== parsed.value.userId) {
    return errorResponse("ユーザーが一致しません", 403);
  }

  const visitor = readOrCreateVisitorId(request);
  const price = await resolvePricingVariant(parsed.value.targetId, session.userId, visitor.visitorId);
  if (!price) {
    return withVisitorCookie(errorResponse("価格設定が見つかりません", 404), visitor.visitorId, visitor.created);
  }

  const hubUrl = hubOrigin();
  const successUrl = `${hubUrl}/${parsed.value.locale}/dashboard?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${hubUrl}/${parsed.value.locale}`;

  if (isStripeMockMode()) {
    const fulfilled = await fulfillPurchase({
      userId: session.userId,
      entityType: price.entityType,
      targetId: price.targetId,
      abTestId: price.abTestId,
      variant: price.variant,
    });
    if (!fulfilled.ok) {
      return withVisitorCookie(errorResponse(fulfilled.message, fulfilled.status), visitor.visitorId, visitor.created);
    }
    if (price.abTestId && price.variant && claimCompletedSession(`mock:${session.userId}:${price.abTestId}:${price.targetId}`)) {
      await recordAbTestEvent({
        testId: price.abTestId,
        userId: session.userId,
        visitorId: visitor.visitorId,
        variant: price.variant,
        eventType: "checkout_start",
      });
      await recordAbTestEvent({
        testId: price.abTestId,
        userId: session.userId,
        visitorId: visitor.visitorId,
        variant: price.variant,
        eventType: "conversion",
      });
    }

    const claims = sessionClaimsForUser(fulfilled.user);
    let token: string;
    let maxAge = 60 * 60 * 24 * 7;
    try {
      maxAge = sessionTtlSeconds(await readAuthSettings());
      token = signSession(claims, maxAge);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "JWTの発行に失敗しました";
      return errorResponse(message, 500);
    }

    const response = NextResponse.json<CheckoutSuccess>({
      ok: true,
      mock: true,
      url: `${hubUrl}/${parsed.value.locale}/dashboard?mock_success=true`,
      entityType: price.entityType,
      targetId: price.targetId,
      patternId: price.patternId,
      abTestId: price.abTestId,
      variant: price.variant,
    });
    response.headers.append("Set-Cookie", buildSessionCookie(token, maxAge));
    return withVisitorCookie(response, visitor.visitorId, visitor.created);
  }

  if (price.stripePriceId.length === 0) {
    return withVisitorCookie(errorResponse("Stripeの価格IDが未設定です", 409), visitor.visitorId, visitor.created);
  }

  try {
    const url = await createSubscriptionCheckoutUrl({
      email: session.email,
      userId: session.userId,
      targetId: price.targetId,
      entityType: price.entityType,
      stripePriceId: price.stripePriceId,
      trialDays: price.trialDays,
      abTestId: price.abTestId,
      variant: price.variant,
      successUrl,
      cancelUrl,
    });
    if (!url) {
      return errorResponse("Checkout URLを取得できませんでした", 502);
    }
    if (price.abTestId && price.variant) {
      await recordAbTestEvent({
        testId: price.abTestId,
        userId: session.userId,
        visitorId: visitor.visitorId,
        variant: price.variant,
        eventType: "checkout_start",
      });
    }
    const response = NextResponse.json<CheckoutSuccess>({
      ok: true,
      mock: false,
      url,
      entityType: price.entityType,
      targetId: price.targetId,
      patternId: price.patternId,
      abTestId: price.abTestId,
      variant: price.variant,
    });
    return withVisitorCookie(response, visitor.visitorId, visitor.created);
  } catch {
    return errorResponse("Stripe Checkoutの作成に失敗しました", 502);
  }
}
