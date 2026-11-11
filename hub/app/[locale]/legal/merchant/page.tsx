import { redirectLegalTab } from "../../../../src/legal/redirect";

export default function MerchantPage({ params }: { params: Promise<{ locale: string }> }) {
  return redirectLegalTab(params, "merchant");
}
