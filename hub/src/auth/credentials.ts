export interface Credentials {
  email: string;
  password: string;
}

export type CredentialResult =
  | { ok: true; credentials: Credentials }
  | { ok: false; message: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseCredentials(body: unknown): CredentialResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, message: "リクエスト形式が不正です" };
  }

  const record = body as Record<string, unknown>;
  if (typeof record.email !== "string" || typeof record.password !== "string") {
    return { ok: false, message: "email と password が必要です" };
  }

  const email = record.email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, message: "メールアドレスの形式が不正です" };
  }

  if (record.password.length < 8 || record.password.length > 72) {
    return { ok: false, message: "パスワードは8文字以上72文字以内です" };
  }

  return {
    ok: true,
    credentials: {
      email,
      password: record.password,
    },
  };
}
