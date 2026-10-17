import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 32;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const separator = stored.indexOf(":");
  if (separator <= 0) {
    return false;
  }

  const salt = stored.slice(0, separator);
  const hash = stored.slice(separator + 1);
  const actual = scryptSync(password, salt, KEY_LENGTH);
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}
