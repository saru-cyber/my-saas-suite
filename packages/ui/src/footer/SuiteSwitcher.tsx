"use client";

import { Check, Grip } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

export interface SuiteSwitcherLink {
  href: string;
  label: string;
}

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

/** The menu entry for the app currently on screen, if one matches. */
export function activeSuiteLinkHref(
  links: readonly SuiteSwitcherLink[],
  location: { origin: string | null; pathname: string },
): string | null {
  const currentPath = normalizePath(location.pathname);
  let best: { href: string; score: number } | null = null;

  for (const link of links) {
    let url: URL;
    try {
      url = new URL(link.href);
    } catch {
      continue;
    }
    const linkPath = normalizePath(url.pathname);
    const sameOrigin = location.origin !== null && url.origin === location.origin;
    const pathMatches =
      linkPath !== "/" && (currentPath === linkPath || currentPath.startsWith(`${linkPath}/`));
    let score = 0;
    if (pathMatches && sameOrigin) {
      score = 1000 + linkPath.length;
    } else if (sameOrigin && linkPath === "/") {
      score = 10;
    } else if (location.origin !== null && pathMatches) {
      score = linkPath.length / 1000;
    }
    if (score > 0 && (best === null || score > best.score)) {
      best = { href: link.href, score };
    }
  }

  return best?.href ?? null;
}

export function SuiteSwitcher({
  menuLabel,
  links,
  currentOrigin = null,
  activeHref,
}: {
  menuLabel: string;
  links: SuiteSwitcherLink[];
  /** Origin of the page that is open now. Used to mark that app in the menu. */
  currentOrigin?: string | null;
  /** Overrides URL matching when the surrounding app already knows which item is current. */
  activeHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const resolvedActiveHref = activeHref ?? activeSuiteLinkHref(links, { origin: currentOrigin, pathname });

  useEffect(() => {
    if (!open) {
      return;
    }
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex min-h-11 items-center whitespace-nowrap text-sm text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
      >
        <Grip aria-hidden="true" className="mr-1.5 h-3.5 w-3.5 opacity-70" />
        <span>{menuLabel}</span>
        <span aria-hidden="true" className="ml-1.5 text-xs leading-none">
          ▴
        </span>
      </button>
      {open ? (
        <ul
          id={menuId}
          role="menu"
          className="absolute bottom-full left-1/2 z-50 mb-1 min-w-56 -translate-x-1/2 border border-border/40 bg-background py-1 text-sm text-foreground"
        >
          {links.map((link) => (
            <li key={`${link.href}:${link.label}`} role="none">
              <a
                role="menuitem"
                href={link.href}
                aria-current={link.href === resolvedActiveHref ? "page" : undefined}
                className="flex min-h-11 items-center gap-3 px-3 transition-colors duration-150 ease-out hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset motion-reduce:transition-none"
                onClick={() => setOpen(false)}
              >
                <span className="min-w-0 flex-1">{link.label}</span>
                {link.href === resolvedActiveHref ? (
                  <Check aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={2} />
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
