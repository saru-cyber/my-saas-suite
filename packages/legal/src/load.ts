import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { isLegalLocale, LEGAL_SLUGS, type LegalDocument, type LegalLocale, type LegalSlug } from "./documents";

const FILE_BY_SLUG: Record<LegalSlug, string> = {
  terms: "terms.md",
  privacy: "privacy.md",
  tokushoho: "tokushoho.md",
  "specified-electronic-mail": "specified-electronic-mail.md",
};

function readIfPresent(file: string): string | null {
  if (!existsSync(file)) {
    return null;
  }
  return readFileSync(/*turbopackIgnore: true*/ file, "utf8");
}

function readLegalFile(locale: LegalLocale, filename: string): string {
  const source =
    readIfPresent(join(/*turbopackIgnore: true*/ process.cwd(), "packages/legal/content", locale, filename)) ??
    readIfPresent(join(/*turbopackIgnore: true*/ process.cwd(), "../packages/legal/content", locale, filename)) ??
    readIfPresent(join(/*turbopackIgnore: true*/ process.cwd(), "../../packages/legal/content", locale, filename));
  if (source === null) {
    throw new Error(`Legal markdown was not found: ${locale}/${filename}`);
  }
  return source;
}

function readScalar(frontmatter: string, key: string, file: string): string {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  if (!match) {
    throw new Error(`${file} is missing frontmatter field "${key}".`);
  }
  let value = match[1].trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  if (!value) {
    throw new Error(`${file} has an empty frontmatter field "${key}".`);
  }
  return value;
}

export function loadLegalDocument(locale: LegalLocale, slug: LegalSlug): LegalDocument {
  const file = `${locale}/${FILE_BY_SLUG[slug]}`;
  const source = readLegalFile(locale, FILE_BY_SLUG[slug]).replace(/^\uFEFF/, "");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    throw new Error(`${file} is missing frontmatter.`);
  }

  return {
    slug,
    locale,
    title: readScalar(match[1], "title", file),
    effectiveDate: readScalar(match[1], "effectiveDate", file),
    updatedAt: readScalar(match[1], "updatedAt", file),
    body: source.slice(match[0].length).trim(),
  };
}

export function loadLegalCatalog(locale: LegalLocale): LegalDocument[] {
  if (!isLegalLocale(locale)) {
    throw new Error(`Unsupported legal locale: ${locale}`);
  }
  return LEGAL_SLUGS.map((slug) => loadLegalDocument(locale, slug));
}
