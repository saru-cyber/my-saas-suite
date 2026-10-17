export interface SuiteSessionClaims {
  userId: string;
  email: string;
  activeProducts: string[];
  plan: string;
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
    typeof record.plan === "string"
  );
}
