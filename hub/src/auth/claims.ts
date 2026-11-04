export type SuiteRole = "admin" | "member";

export interface SuiteSessionClaims {
  userId: string;
  email: string;
  activeProducts: string[];
  plan: string;
  role: SuiteRole;
}

export function isSuiteSessionClaims(value: unknown): value is SuiteSessionClaims {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.userId === "string" &&
    typeof record.email === "string" &&
    Array.isArray(record.activeProducts) &&
    record.activeProducts.every((product) => typeof product === "string") &&
    typeof record.plan === "string" &&
    (record.role === undefined || record.role === "admin" || record.role === "member")
  );
}

export function roleFromClaims(value: unknown): SuiteRole {
  return value === "admin" ? "admin" : "member";
}
