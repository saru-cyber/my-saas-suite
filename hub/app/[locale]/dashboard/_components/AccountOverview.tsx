import { CreditCard, ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "../../../../i18n/navigation";

interface AccountOverviewProps {
  displayName: string;
  email: string;
  portalHref: string;
  portalExternal: boolean;
  showAdminLink: boolean;
}

export async function AccountOverview({
  displayName,
  email,
  portalHref,
  portalExternal,
  showAdminLink,
}: AccountOverviewProps) {
  const t = await getTranslations("dashboard");

  return (
    <header className="flex flex-col gap-6 border-b border-border/40 pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{displayName}</h1>
        <p className="mt-1 break-all text-sm text-muted-foreground">{email}</p>
        {showAdminLink ? (
          <Link href="/admin/settings" className="mt-3 inline-flex text-sm font-medium text-primary">
            {t("adminSettings")}
          </Link>
        ) : null}
      </div>
      <a
        href={portalHref}
        {...(portalExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="inline-flex shrink-0 items-center gap-2 self-start rounded-md border border-border/40 bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors duration-150 ease-out hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
      >
        <CreditCard className="size-4" aria-hidden />
        {t("manageBilling")}
        <ExternalLink className="size-4 text-muted-foreground" aria-hidden />
      </a>
    </header>
  );
}
