import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import { SESSION_COOKIE_NAME, verifySession } from "../../../src/auth/session";
import { routing } from "../../../i18n/routing";
import { AdminNav } from "./_components/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? verifySession(token) : null;
  if (!session) {
    redirect(`/${locale}/login`);
  }
  if (!session.isAdmin) {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <>
      <AdminNav />
      {children}
    </>
  );
}
