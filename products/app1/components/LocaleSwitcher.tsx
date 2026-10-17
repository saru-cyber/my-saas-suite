"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "../i18n/navigation";

export function LocaleSwitcher() {
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <p className="mt-2 text-sm">
      <Link href={pathname} locale="en" className={locale === "en" ? "underline" : undefined}>
        EN
      </Link>
      {" | "}
      <Link href={pathname} locale="ja" className={locale === "ja" ? "underline" : undefined}>
        JA
      </Link>
    </p>
  );
}
