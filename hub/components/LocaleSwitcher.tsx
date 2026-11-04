"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "../i18n/navigation";

export function LocaleSwitcher() {
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <p className="text-sm text-muted-foreground">
      <Link
        href={pathname}
        locale="en"
        className={locale === "en" ? "text-foreground underline" : "hover:text-foreground"}
      >
        EN
      </Link>
      {" | "}
      <Link
        href={pathname}
        locale="ja"
        className={locale === "ja" ? "text-foreground underline" : "hover:text-foreground"}
      >
        JA
      </Link>
    </p>
  );
}
