import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Users } from "lucide-react";
import { notFound } from "next/navigation";
import { Link } from "../../../../i18n/navigation";
import { routing } from "../../../../i18n/routing";
import { listUsers, type PublicUser } from "../../../../src/db/users";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return {};
  }
  setRequestLocale(locale);
  const t = await getTranslations("admin.users");
  return { title: t("metaTitle") };
}

export default async function AdminUsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations("admin.users");
  const users = listUsers();
  const registered = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pt-6 pb-16 md:px-8 md:pt-8">
      <header className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("lead")}</p>
      </header>
      {users.length === 0 ? (
        <EmptyUsers title={t("emptyTitle")} body={t("emptyBody")} action={t("emptyAction")} />
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <caption className="sr-only">{t("title")}</caption>
            <thead>
              <tr className="border-b border-border/40 text-xs text-muted-foreground">
                <th scope="col" className="px-3 py-3 font-medium">{t("columns.id")}</th>
                <th scope="col" className="px-3 py-3 font-medium">{t("columns.email")}</th>
                <th scope="col" className="px-3 py-3 font-medium">{t("columns.role")}</th>
                <th scope="col" className="px-3 py-3 font-medium">{t("columns.plan")}</th>
                <th scope="col" className="px-3 py-3 font-medium">{t("columns.products")}</th>
                <th scope="col" className="px-3 py-3 font-medium">{t("columns.createdAt")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {users.map((user) => (
                <UserRow key={user.id} user={user} registered={registered.format(user.createdAt)} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function UserRow({ user, registered }: { user: PublicUser; registered: string }) {
  return (
    <tr className="align-top">
      <td className="px-3 py-3 font-mono text-xs whitespace-nowrap text-muted-foreground">{user.id}</td>
      <td className="px-3 py-3 whitespace-nowrap text-foreground">{user.email}</td>
      <td className="px-3 py-3"><RoleBadge role={user.role} /></td>
      <td className="px-3 py-3 text-foreground"><PlanLabel plan={user.plan} /></td>
      <td className="px-3 py-3"><ProductBadges products={user.activeProducts} /></td>
      <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">{registered}</td>
    </tr>
  );
}

async function RoleBadge({ role }: { role: PublicUser["role"] }) {
  const t = await getTranslations("admin.users.roles");
  const tone = role === "admin" ? "bg-primary/10 text-primary" : "bg-muted/60 text-muted-foreground";
  return <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${tone}`}>{t(role)}</span>;
}

async function PlanLabel({ plan }: { plan: string }) {
  const t = await getTranslations("admin.users.plans");
  if (plan === "free" || plan === "pro") {
    return t(plan);
  }
  return plan;
}

async function ProductBadges({ products }: { products: string[] }) {
  const t = await getTranslations("admin.users");
  if (products.length === 0) {
    return <span className="text-muted-foreground">{t("noProducts")}</span>;
  }
  return (
    <ul className="flex flex-wrap gap-1.5">
      {products.map((product) => (
        <li key={product}>
          <span className="inline-flex items-center rounded-md bg-muted/60 px-2 py-1 text-xs font-medium text-foreground">{product}</span>
        </li>
      ))}
    </ul>
  );
}

function EmptyUsers({ title, body, action }: { title: string; body: string; action: string }) {
  return (
    <div className="mt-10 flex max-w-md flex-col items-start gap-3">
      <Users className="size-5 text-muted-foreground" aria-hidden />
      <h2 className="text-base font-medium text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{body}</p>
      <Link
        href="/login"
        className="inline-flex min-h-11 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors duration-150 ease-out hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
      >
        {action}
      </Link>
    </div>
  );
}
