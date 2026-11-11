export function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

export function hubOrigin(explicit?: string): string {
  return stripTrailingSlash(explicit || process.env.NEXT_PUBLIC_HUB_URL || "http://localhost:3000");
}

export function app1Origin(explicit?: string): string {
  return stripTrailingSlash(explicit || process.env.NEXT_PUBLIC_APP1_URL || "http://localhost:3001");
}
