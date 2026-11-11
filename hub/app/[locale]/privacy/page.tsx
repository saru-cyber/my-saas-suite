import { redirectLegalTab } from "../../../src/legal/redirect";

export default function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  return redirectLegalTab(params, "privacy");
}
