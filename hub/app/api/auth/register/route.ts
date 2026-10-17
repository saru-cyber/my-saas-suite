import { NextResponse } from "next/server";
import { parseCredentials } from "../../../../src/auth/credentials";
import { registerUser } from "../../../../src/db/users";

export const runtime = "nodejs";

interface RegisterSuccess {
  ok: true;
  message: string;
  user: {
    userId: string;
    email: string;
    activeProducts: string[];
    plan: string;
  };
}

interface ErrorBody {
  ok: false;
  message: string;
}

export async function POST(request: Request): Promise<NextResponse<RegisterSuccess | ErrorBody>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "不正なJSONです" }, { status: 400 });
  }

  const parsed = parseCredentials(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, message: parsed.message }, { status: 400 });
  }

  const result = registerUser(parsed.credentials.email, parsed.credentials.password);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: result.message },
      { status: result.status },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "登録しました",
    user: {
      userId: result.user.id,
      email: result.user.email,
      activeProducts: result.user.activeProducts,
      plan: result.user.plan,
    },
  });
}
