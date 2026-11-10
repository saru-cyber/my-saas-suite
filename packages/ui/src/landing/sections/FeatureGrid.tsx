import { icons, type LucideIcon } from "lucide-react";
import type { LPFeature } from "../types";
import { SectionHeading, type SectionHeadingProps } from "./SectionHeading";

export interface FeatureGridProps extends SectionHeadingProps {
  features: LPFeature[];
  /** Anchor id for in-page links. */
  id?: string;
}

/** Resolves a lucide-react icon by PascalCase name, falling back to `Sparkles`. */
function resolveIcon(name: string): LucideIcon {
  return (icons as Record<string, LucideIcon | undefined>)[name] ?? icons.Sparkles;
}

export function FeatureGrid({ features, id = "features", heading, description }: FeatureGridProps) {
  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16 sm:py-20 md:px-8">
      <SectionHeading heading={heading} description={description} />
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {features.map((feature) => {
          const Icon = resolveIcon(feature.iconName);
          return (
            <li key={feature.title} className="rounded-lg border border-border/40 bg-card/60 p-6">
              <div className="mb-4 w-fit rounded-md bg-muted/50 p-2 text-primary">
                <Icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
              </div>
              <h3 className="text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
