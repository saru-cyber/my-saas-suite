import { parseCookie } from "cookie";
import { NextResponse } from "next/server";
import type { SuiteSessionClaims } from "../../../../src/auth/claims";
import { SESSION_COOKIE_NAME, verifySession } from "../../../../src/auth/session";

export const runtime = "nodejs";

interface SessionSuccess {
  ok: true;
  user: SuiteSessionClaims;
}

interface ErrorBody {
  ok: false;
  message: string;
}

export async function GET(request: Request): Promise<NextResponse<SessionSuccess | ErrorBody>> {
  const cookieHeader = request.headers.get("cookie");
  const token = cookieHeader ? parseCookie(cookieHeader)[SESSION_COOKIE_NAME] : undefined;
  if (!token) {
    return NextResponse.json({ ok: false, message: "未ログインです" }, { status: 401 });
  }

  try {
    const user = verifySession(token);
    if (!user) {
      return NextResponse.json({ ok: false, message: "セッションが無効です" }, { status: 401 });
    }
    return NextResponse.json({ ok: true, user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "セッションの確認に失敗しました";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
