import { NextResponse } from "next/server";
import { parseCredentials } from "../../../../src/auth/credentials";
import { buildSessionCookie, signSession } from "../../../../src/auth/session";
import type { SuiteSessionClaims } from "../../../../src/auth/claims";
import { authenticateUser } from "../../../../src/db/users";

export const runtime = "nodejs";

interface LoginSuccess {
  ok: true;
  message: string;
  user: SuiteSessionClaims;
}

interface ErrorBody {
  ok: false;
  message: string;
}

function errorResponse(message: string, status: number): NextResponse<ErrorBody> {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: Request): Promise<NextResponse<LoginSuccess | ErrorBody>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("不正なJSONです", 400);
  }

  const parsed = parseCredentials(body);
  if (!parsed.ok) {
    return errorResponse(parsed.message, 400);
  }

  const user = authenticateUser(parsed.credentials.email, parsed.credentials.password);
  if (!user) {
    return errorResponse("メールアドレスまたはパスワードが違います", 401);
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

  const response = NextResponse.json<LoginSuccess>({
    ok: true,
    message: "ログインしました",
    user: claims,
  });
  response.headers.append("Set-Cookie", buildSessionCookie(token));
  return response;
}
