export interface ProductSite {
  companyName: string;
  suiteName: string;
}

export const productSite: ProductSite = {
  companyName: "Your Company",
  suiteName: "Suite",
};

export function readHubUrl(): string {
  const configured = process.env.NEXT_PUBLIC_HUB_URL;
  if (!configured) {
    return "http://localhost:3000";
  }
  return configured.replace(/\/$/, "");
}
