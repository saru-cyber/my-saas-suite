import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { primaryAdminEmail } from "../../../src/auth/admin";
import { isGoogleConfigured, isMockLoginEnabled } from "../../../src/auth/google";
import { enabledAuthProviders } from "../../../src/auth/providers";
import { routing } from "../../../i18n/routing";
import { readAuthSettings } from "../../../src/settings/store";
import { LoginScreen } from "./LoginScreen";

export const dynamic = "force-dynamic";

function readError(value: string | string[] | undefined): "google" | "google_unconfigured" | null {
  const error = Array.isArray(value) ? value[0] : value;
  if (error === "google" || error === "google_unconfigured") {
    return error;
  }
  return null;
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const [auth, query] = await Promise.all([readAuthSettings(), searchParams]);
  const googleReady = isGoogleConfigured(auth.googleClientId, auth.googleClientSecret);
  const mockEnabled = isMockLoginEnabled(googleReady);

  return (
    <LoginScreen
      googleReady={googleReady}
      mockEnabled={mockEnabled}
      mockAdminEmail={mockEnabled && process.env.NODE_ENV !== "production" ? primaryAdminEmail() : null}
      initialError={readError(query.error)}
      providerIds={enabledAuthProviders().map((provider) => provider.id)}
    />
  );
}
