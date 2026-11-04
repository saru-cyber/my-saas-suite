import { Box } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { suiteProductLaunchUrl, suiteProducts, type SuiteProduct } from "../../../../src/products/catalog";

interface ProductAccessGridProps {
  locale: string;
  activeProducts: string[];
}

export async function ProductAccessGrid({ locale, activeProducts }: ProductAccessGridProps) {
  const t = await getTranslations("dashboard");
  const knownIds = new Set<string>(suiteProducts.map((product) => product.id));
  const unknownProducts = activeProducts.filter((productId) => !knownIds.has(productId));

  function productCopy(productId: SuiteProduct["id"]) {
    switch (productId) {
      case "app1":
        return {
          name: t("products.items.app1.name"),
          description: t("products.items.app1.description"),
        };
    }
  }

  return (
    <section className="mt-12" aria-labelledby="product-access-heading">
      <div className="max-w-2xl">
        <h2 id="product-access-heading" className="text-base font-semibold text-foreground">
          {t("products.heading")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("products.lead")}</p>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {suiteProducts.map((product) => {
          const copy = productCopy(product.id);
          return (
            <ProductCard
              key={product.id}
              name={copy.name}
              description={copy.description}
              entitled={activeProducts.includes(product.id)}
              launchUrl={suiteProductLaunchUrl(product.id, locale)}
              launchLabel={t("products.launch")}
              upsellLabel={t("products.upsell")}
            />
          );
        })}
        {unknownProducts.map((productId) => (
          <ProductCard
            key={productId}
            name={productId}
            description={t("products.unknownDescription")}
            entitled
            launchUrl={null}
            launchLabel={t("products.launch")}
            upsellLabel={t("products.upsell")}
            unavailableLabel={t("products.launchUnavailable")}
          />
        ))}
      </div>
    </section>
  );
}

interface ProductCardProps {
  name: string;
  description: string;
  entitled: boolean;
  launchUrl: string | null;
  launchLabel: string;
  upsellLabel: string;
  unavailableLabel?: string;
}

function ProductCard({
  name,
  description,
  entitled,
  launchUrl,
  launchLabel,
  upsellLabel,
  unavailableLabel,
}: ProductCardProps) {
  const canLaunch = entitled && launchUrl !== null;

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-border/40 bg-card/60 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted/40 text-foreground">
          <Box className="size-4" aria-hidden />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-foreground">{name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {entitled ? null : (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {upsellLabel}
          </span>
        )}
        {canLaunch && launchUrl ? (
          <a
            href={launchUrl}
            className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors duration-150 ease-out hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
          >
            {launchLabel}
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center rounded-md border border-border/40 bg-muted/40 px-3 py-1.5 text-sm font-medium text-muted-foreground"
          >
            {entitled ? (unavailableLabel ?? launchLabel) : launchLabel}
          </button>
        )}
      </div>
    </article>
  );
}
