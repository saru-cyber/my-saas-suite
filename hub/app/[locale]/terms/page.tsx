import { redirectLegalTab } from "../../../src/legal/redirect";

export default function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  return redirectLegalTab(params, "terms");
}
