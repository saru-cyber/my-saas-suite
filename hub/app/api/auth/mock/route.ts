import { NextResponse } from "next/server";
import { primaryAdminEmail } from "../../../../src/auth/admin";
import type { SuiteSessionClaims } from "../../../../src/auth/claims";
import { isGoogleConfigured, isMockLoginEnabled } from "../../../../src/auth/google";
import { buildSessionCookie, signSession } from "../../../../src/auth/session";
import {
  findUserByEmail,
  MOCK_MEMBER_EMAIL,
  sessionClaimsForUser,
  upsertOAuthUser,
} from "../../../../src/db/users";
import { readAuthSettings, sessionTtlSeconds } from "../../../../src/settings/store";

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

function readPersona(body: unknown): "member" | "admin" | null {
  if (typeof body !== "object" || body === null || !("persona" in body)) {
    return null;
  }
  const persona = (body as { persona?: unknown }).persona;
  return persona === "member" || persona === "admin" ? persona : null;
}

export async function POST(request: Request): Promise<NextResponse<LoginSuccess | ErrorBody>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("不正なJSONです", 400);
  }

  const persona = readPersona(body);
  if (!persona) {
    return errorResponse("persona は member または admin です", 400);
  }

  const auth = await readAuthSettings();
  if (!isMockLoginEnabled(isGoogleConfigured(auth.googleClientId, auth.googleClientSecret))) {
    return errorResponse("開発用モックログインは無効です", 404);
  }
  if (persona === "admin" && process.env.NODE_ENV === "production") {
    return errorResponse("本番環境では管理者のモックログインは使えません", 403);
  }

  const user =
    persona === "admin"
      ? (() => {
          const email = primaryAdminEmail();
          return email ? upsertOAuthUser({ email, name: "Admin", image: null }) : null;
        })()
      : findUserByEmail(MOCK_MEMBER_EMAIL);
  if (!user) {
    return errorResponse(
      persona === "admin" ? "ADMIN_EMAILS が未設定です" : "モックユーザーが見つかりません",
      400,
    );
  }

  const claims = sessionClaimsForUser(user);
  let token: string;
  let maxAge = 60 * 60 * 24 * 7;
  try {
    maxAge = sessionTtlSeconds(auth);
    token = signSession(claims, maxAge);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "JWTの発行に失敗しました";
    return errorResponse(message, 500);
  }

  const response = NextResponse.json<LoginSuccess>({
    ok: true,
    message: "ログインしました",
    user: claims,
  });
  response.headers.append("Set-Cookie", buildSessionCookie(token, maxAge));
  return response;
}
