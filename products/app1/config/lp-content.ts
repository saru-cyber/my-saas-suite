/**
 * App1 landing page copy. Starts from the shared dummy content and overrides
 * what is App1-specific; replace any section here (or the whole object) to
 * change the LP — `app/[locale]/page.tsx` never needs to change.
 * Field reference: `LPContent` in @my-saas-suite/ui/landing.
 */
import { getDefaultLpContent, type LPContent, type LPLocale } from "@my-saas-suite/ui/landing";
import { productSite, readHubUrl } from "../src/site";

const PRODUCT_NAME = productSite.productName;

export function getLpContent(locale: LPLocale): LPContent {
  const base = getDefaultLpContent(locale);
  // Sign-in and purchases are handled by the Hub; /dashboard sends signed-out users there.
  const hubLogin = `${readHubUrl()}/${locale}/login`;
  const ja = locale === "ja";

  return {
    ...base,
    hero: {
      ...base.hero,
      subtitle: ja
        ? `${PRODUCT_NAME} は承認・集計・通知といった繰り返し作業をノーコードで自動化。Suite アカウントでそのまま使い始められます。`
        : `${PRODUCT_NAME} automates approvals, reporting, and notifications without code — and works with your existing Suite account.`,
      primaryCta: { label: ja ? "ダッシュボードを開く" : "Open dashboard", href: `/${locale}/dashboard` },
    },
    pricing: {
      singlePlan: {
        ...base.pricing.singlePlan,
        name: ja ? `${PRODUCT_NAME} 単体プラン` : PRODUCT_NAME,
        ctaHref: hubLogin,
      },
      bundlePlan: { ...base.pricing.bundlePlan, ctaHref: hubLogin },
    },
    closingCta: { ...base.closingCta, buttonHref: hubLogin },
  };
}
