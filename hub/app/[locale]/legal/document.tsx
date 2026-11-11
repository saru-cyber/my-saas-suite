import type { LegalField, LegalSection } from "../../../src/legal/documents";

export function LegalFields({ rows }: { rows: LegalField[] }) {
  return (
    <dl className="mt-6 divide-y divide-border/30 border-y border-border/30 text-sm">
      {rows.map((row) => (
        <div key={row.label} className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4">
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd className="text-foreground">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function LegalSections({ sections, headingLevel = "h3" }: { sections: LegalSection[]; headingLevel?: "h3" | "h4" | "h5" }) {
  const Heading = headingLevel;
  return (
    <div className="mt-8 flex flex-col gap-8">
      {sections.map((section) => (
        <section key={section.heading}>
          <Heading className="text-base font-medium text-foreground">{section.heading}</Heading>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-2 text-sm leading-6 text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
