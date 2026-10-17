import { NextResponse } from "next/server";
import type { SuiteSessionClaims } from "../../../../src/auth/claims";
import { buildSessionCookie, readSessionFromRequest, signSession } from "../../../../src/auth/session";
import {
  createStripeCheckoutUrl,
  isStripeMockMode,
  MOCK_CHECKOUT_SUCCESS_URL,
  parseCheckoutInput,
} from "../../../../src/billing/stripe";
import { grantProductAccess } from "../../../../src/db/users";

export const runtime = "nodejs";

interface CheckoutSuccess {
  ok: true;
  mock: boolean;
  url: string;
}

interface ErrorBody {
  ok: false;
  message: string;
}

function errorResponse(message: string, status: number): NextResponse<ErrorBody> {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: Request): Promise<NextResponse<CheckoutSuccess | ErrorBody>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("不正なJSONです", 400);
  }

  const parsed = parseCheckoutInput(body);
  if (!parsed.ok) {
    return errorResponse(parsed.message, 400);
  }

  const session = readSessionFromRequest(request);
  if (!session) {
    return errorResponse("ログインが必要です", 401);
  }
  if (session.userId !== parsed.input.userId) {
    return errorResponse("ユーザーが一致しません", 403);
  }

  if (isStripeMockMode()) {
    const user = grantProductAccess(parsed.input.userId, parsed.input.targetProduct);
    if (!user) {
      return errorResponse("ユーザーが見つかりません", 404);
    }

    const claims: SuiteSessionClaims = {
      userId: user.id,
      email: user.email,
      activeProducts: user.activeProducts,
      plan: user.plan,
    };

    let token: string;
    try {
      token = signSession(claims);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "JWTの発行に失敗しました";
      return errorResponse(message, 500);
    }

    const response = NextResponse.json<CheckoutSuccess>({
      ok: true,
      mock: true,
      url: MOCK_CHECKOUT_SUCCESS_URL,
    });
    response.headers.append("Set-Cookie", buildSessionCookie(token));
    return response;
  }

  try {
    const url = await createStripeCheckoutUrl({
      ...parsed.input,
      email: session.email,
    });
    if (!url) {
      return errorResponse("Checkout URLを取得できませんでした", 502);
    }
    return NextResponse.json<CheckoutSuccess>({ ok: true, mock: false, url });
  } catch {
    return errorResponse("Stripe Checkoutの作成に失敗しました", 502);
  }
}
