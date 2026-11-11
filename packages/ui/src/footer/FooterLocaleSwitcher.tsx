"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { FooterLocale } from "./labels";

const LOCALES: { value: FooterLocale; label: string }[] = [
  { value: "ja", label: "JA" },
  { value: "en", label: "EN" },
];

/** Swaps (or prepends) the leading `/{locale}` segment and keeps the query string. */
export function localizedPath(pathname: string, locale: FooterLocale, search = ""): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "ja" || segments[0] === "en") {
    segments[0] = locale;
  } else {
    segments.unshift(locale);
  }
  const path = `/${segments.join("/")}`;
  if (!search) {
    return path;
  }
  return `${path}${search.startsWith("?") ? search : `?${search}`}`;
}

export function FooterLocaleSwitcher({
  currentLocale,
  ariaLabel,
}: {
  currentLocale: FooterLocale;
  ariaLabel: string;
}) {
  const pathname = usePathname() ?? "/";
  const search = useSearchParams().toString();

  return (
    <nav
      aria-label={ariaLabel}
      className="inline-flex min-h-11 items-center gap-1.5 text-sm"
    >
      {LOCALES.map(({ value, label }, index) => {
        const active = value === currentLocale;
        return (
          <span key={value} className="inline-flex items-center gap-1.5">
            {index > 0 ? (
              <span aria-hidden="true" className="select-none text-zinc-600">
                |
              </span>
            ) : null}
            <a
              href={localizedPath(pathname, value, search)}
              hrefLang={value}
              aria-current={active ? "true" : undefined}
              className={
                active
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              {label}
            </a>
          </span>
        );
      })}
    </nav>
  );
}
