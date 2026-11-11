export interface SuiteProduct {
  id: "app1";
}

export const suiteProducts: readonly SuiteProduct[] = [{ id: "app1" }];

function app1Origin(): string {
  const configured = process.env.NEXT_PUBLIC_APP1_URL;
  if (configured && configured.length > 0) {
    return configured.replace(/\/$/, "");
  }
  return "http://localhost:3001";
}

export function suiteProductLaunchUrl(productId: SuiteProduct["id"], locale: string): string {
  switch (productId) {
    case "app1":
      return `${app1Origin()}/${locale}/dashboard`;
  }
}

export function suiteProductHomeUrl(productId: SuiteProduct["id"], locale: string): string {
  switch (productId) {
    case "app1":
      return `${app1Origin()}/${locale}`;
  }
}
