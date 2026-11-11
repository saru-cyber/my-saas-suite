const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Comma-separated addresses in ADMIN_EMAILS. Comparison is case-insensitive. */
export function readAdminEmails(): string[] {
  const seen = new Set<string>();
  const emails: string[] = [];
  for (const part of (process.env.ADMIN_EMAILS ?? "").split(",")) {
    const email = part.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email) || seen.has(email)) {
      continue;
    }
    seen.add(email);
    emails.push(email);
  }
  return emails;
}

export function isAdminEmail(email: string): boolean {
  return readAdminEmails().includes(email.trim().toLowerCase());
}

/** First configured admin address. Mock admin sign-in uses this. */
export function primaryAdminEmail(): string | null {
  return readAdminEmails()[0] ?? null;
}
