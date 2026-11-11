const MAX_NAME_LENGTH = 120;
const MAX_IMAGE_LENGTH = 2048;

export function sanitizeName(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  return cleaned.slice(0, MAX_NAME_LENGTH);
}

export function sanitizeImage(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0 || value.length > MAX_IMAGE_LENGTH) {
    return null;
  }
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}
