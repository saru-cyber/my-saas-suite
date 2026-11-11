"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "../../../../i18n/navigation";

const LINKS = [
  { href: "/admin/settings", labelKey: "settings" },
  { href: "/admin/users", labelKey: "users" },
] as const;

export function AdminNav() {
  const t = useTranslations("admin.nav");
  const pathname = usePathname();

  return (
    <nav aria-label={t("label")} className="border-b border-border/40">
      <ul className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-6 md:px-8">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "inline-flex min-h-11 items-center border-b-2 border-foreground px-3 text-sm font-medium whitespace-nowrap text-foreground"
                    : "inline-flex min-h-11 items-center border-b-2 border-transparent px-3 text-sm whitespace-nowrap text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
                }
              >
                {t(link.labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
