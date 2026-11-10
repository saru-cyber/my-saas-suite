import { getTranslations } from "next-intl/server";
import { PlaceholderPage, preparePlaceholderLocale } from "../../../components/PlaceholderPage";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  preparePlaceholderLocale(locale);
  const t = await getTranslations("privacy");
  return <PlaceholderPage title={t("title")} body={t("comingSoon")} />;
}
