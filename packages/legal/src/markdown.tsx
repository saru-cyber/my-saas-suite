import { Fragment, type ReactNode } from "react";

type Block =
  | { type: "heading"; level: 2 | 3 | 4; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; rows: string[][] };

const INLINE_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;

function safeUrl(url: string): string | null {
  const trimmed = url.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) {
    return trimmed;
  }
  return null;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = new RegExp(INLINE_PATTERN.source, "g");
  let last = 0;
  let index = 0;

  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > last) {
      nodes.push(text.slice(last, start));
    }
    if (match[1] && match[2]) {
      const href = safeUrl(match[2]);
      nodes.push(
        href ? (
          <a
            key={`${keyPrefix}-link-${index}`}
            href={href}
            className="underline decoration-border underline-offset-2 hover:text-foreground"
          >
            {match[1]}
          </a>
        ) : (
          <Fragment key={`${keyPrefix}-link-${index}`}>{match[1]}</Fragment>
        ),
      );
    } else if (match[3]) {
      nodes.push(
        <strong key={`${keyPrefix}-strong-${index}`} className="font-medium text-foreground">
          {match[3]}
        </strong>,
      );
    } else if (match[4]) {
      nodes.push(<em key={`${keyPrefix}-em-${index}`}>{match[4]}</em>);
    }
    last = start + match[0].length;
    index += 1;
  }

  if (last < text.length) {
    nodes.push(text.slice(last));
  }
  return nodes;
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparator(cells: string[]): boolean {
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function fieldItems(items: string[]): { label: string; value: string }[] | null {
  const rows: { label: string; value: string }[] = [];
  for (const item of items) {
    const match = /^([^:：]+)\s*[:：]\s+(.+)$/.exec(item);
    if (!match) {
      return null;
    }
    rows.push({ label: match[1].trim(), value: match[2].trim() });
  }
  return rows;
}

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (line.trim() === "") {
      index += 1;
      continue;
    }

    const heading = /^(#{2,4})\s+(.+?)\s*#*$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      if (level === 2 || level === 3 || level === 4) {
        blocks.push({ type: "heading", level, text: heading[2].trim() });
      }
      index += 1;
      continue;
    }

    if (line.trim().startsWith("|")) {
      const rows: string[][] = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        const cells = parseTableRow(lines[index]);
        if (!isTableSeparator(cells)) {
          rows.push(cells);
        }
        index += 1;
      }
      if (rows.length > 0) {
        blocks.push({ type: "table", rows });
      }
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*]\s+/, "").trim());
        index += 1;
      }
      blocks.push({ type: "list", ordered: false, items });
      continue;
    }

    if (/^\s*\d+\.\s+/.test(lines[index])) {
      const items: string[] = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+\.\s+/, "").trim());
        index += 1;
      }
      blocks.push({ type: "list", ordered: true, items });
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() !== "" &&
      !/^(#{2,4})\s+/.test(lines[index]) &&
      !lines[index].trim().startsWith("|") &&
      !/^\s*[-*]\s+/.test(lines[index]) &&
      !/^\s*\d+\.\s+/.test(lines[index])
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    const text = paragraph.join(" ");
    if (text) {
      blocks.push({ type: "paragraph", text });
    }
  }

  return blocks;
}

function FieldList({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl className="mt-6 divide-y divide-border/30 border-y border-border/30 text-sm">
      {rows.map((row) => (
        <div key={row.label} className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4">
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd className="text-foreground">{renderInline(row.value, row.label)}</dd>
        </div>
      ))}
    </dl>
  );
}

const headingClass: Record<2 | 3 | 4, string> = {
  2: "mt-8 text-lg font-semibold text-foreground",
  3: "mt-8 text-base font-semibold text-foreground",
  4: "mt-6 text-base font-medium text-foreground",
};

export function LegalMarkdown({ source }: { source: string }) {
  const blocks = parseBlocks(source);

  return (
    <div className="mt-8 flex flex-col">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const Heading = `h${block.level}` as const;
          return (
            <Heading key={`heading-${index}`} className={headingClass[block.level]}>
              {renderInline(block.text, `heading-${index}`)}
            </Heading>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p key={`paragraph-${index}`} className="mt-2 text-sm leading-6 text-muted-foreground">
              {renderInline(block.text, `paragraph-${index}`)}
            </p>
          );
        }

        if (block.type === "list") {
          const fields = fieldItems(block.items);
          if (fields) {
            return <FieldList key={`fields-${index}`} rows={fields} />;
          }
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag
              key={`list-${index}`}
              className={`mt-4 flex flex-col gap-2 pl-5 text-sm leading-6 text-muted-foreground ${block.ordered ? "list-decimal" : "list-disc"}`}
            >
              {block.items.map((item) => (
                <li key={item}>{renderInline(item, item)}</li>
              ))}
            </ListTag>
          );
        }

        const [header, ...body] = block.rows;
        const paired = body.length > 0 && header?.length === 2 && body.every((row) => row.length === 2);
        if (paired) {
          return (
            <FieldList
              key={`table-${index}`}
              rows={body.map((row) => ({ label: row[0] ?? "", value: row[1] ?? "" }))}
            />
          );
        }

        return (
          <div key={`table-${index}`} className="mt-6 overflow-x-auto text-sm">
            <table className="w-full border-y border-border/30 text-left">
              {header ? (
                <thead>
                  <tr>
                    {header.map((cell) => (
                      <th key={cell} className="py-3 pr-4 font-medium text-muted-foreground">
                        {renderInline(cell, `th-${cell}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
              ) : null}
              <tbody>
                {(paired ? [] : body.length > 0 ? body : block.rows).map((row) => (
                  <tr key={row.join("|")} className="border-t border-border/30">
                    {row.map((cell, cellIndex) => (
                      <td key={`${cell}-${cellIndex}`} className="py-3 pr-4 text-foreground">
                        {renderInline(cell, `td-${cell}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
