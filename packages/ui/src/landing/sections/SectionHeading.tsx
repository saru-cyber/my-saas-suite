export interface SectionHeadingProps {
  heading?: string;
  description?: string;
}

/** Optional centered heading shared by LP sections. Renders nothing when both are empty. */
export function SectionHeading({ heading, description }: SectionHeadingProps) {
  if (!heading && !description) {
    return null;
  }
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      {heading ? <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{heading}</h2> : null}
      {description ? <p className="mt-3 text-sm text-muted-foreground sm:text-base">{description}</p> : null}
    </div>
  );
}
