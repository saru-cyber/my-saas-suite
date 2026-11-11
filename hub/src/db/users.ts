import { randomBytes, randomUUID } from "node:crypto";
import { isAdminEmail } from "../auth/admin";
import { toSessionClaims, type SuiteSessionClaims } from "../auth/claims";
import { hashPassword, verifyPassword } from "../auth/password";
import { sanitizeImage, sanitizeName } from "../auth/profile";

export const MOCK_MEMBER_EMAIL = "demo@example.com";

interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  activeProducts: string[];
  plan: string;
  name: string;
  image: string | null;
  createdAt: Date;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  image: string | null;
  activeProducts: string[];
  plan: string;
  role: "admin" | "member";
  createdAt: Date;
}

type UserResult =
  | { ok: true; user: PublicUser }
  | { ok: false; message: string; status: 409 };

const usersByEmail = new Map<string, StoredUser>();
const usersById = new Map<string, StoredUser>();

function toPublicUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    activeProducts: [...user.activeProducts],
    plan: user.plan,
    role: isAdminEmail(user.email) ? "admin" : "member",
    createdAt: user.createdAt,
  };
}

function remember(user: StoredUser): void {
  usersByEmail.set(user.email, user);
  usersById.set(user.id, user);
}

function seedDemoUser(): void {
  remember({
    id: "00000000-0000-4000-8000-000000000001",
    email: MOCK_MEMBER_EMAIL,
    passwordHash: hashPassword("password"),
    activeProducts: [],
    plan: "free",
    name: "Demo User",
    image: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  });
}

seedDemoUser();

export function registerUser(email: string, password: string): UserResult {
  if (usersByEmail.has(email)) {
    return { ok: false, message: "このメールアドレスは登録済みです", status: 409 };
  }

  const user: StoredUser = {
    id: randomUUID(),
    email,
    passwordHash: hashPassword(password),
    activeProducts: [],
    plan: "free",
    name: "",
    image: null,
    createdAt: new Date(),
  };
  remember(user);
  return { ok: true, user: toPublicUser(user) };
}

export function grantProducts(userId: string, productIds: readonly string[]): PublicUser | null {
  const user = usersById.get(userId);
  if (!user) {
    return null;
  }

  const next = new Set(user.activeProducts);
  for (const productId of productIds) {
    if (productId.length > 0) {
      next.add(productId);
    }
  }
  user.activeProducts = [...next];
  user.plan = "pro";
  return toPublicUser(user);
}

export function grantProductAccess(userId: string, productId: string): PublicUser | null {
  return grantProducts(userId, [productId]);
}

export function listUsers(): PublicUser[] {
  return [...usersById.values()]
    .map((user) => ({ ...toPublicUser(user), activeProducts: [...user.activeProducts] }))
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime() || left.email.localeCompare(right.email));
}

export function authenticateUser(email: string, password: string): PublicUser | null {
  const user = usersByEmail.get(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return null;
  }
  return toPublicUser(user);
}

export interface OAuthProfile {
  email: string;
  name: string;
  image: string | null;
}

/** Finds the account by email, or creates one that cannot be used with a password. */
export function upsertOAuthUser(profile: OAuthProfile): PublicUser {
  const email = profile.email.trim().toLowerCase();
  const existing = usersByEmail.get(email);
  if (existing) {
    existing.name = sanitizeName(profile.name) || existing.name;
    existing.image = sanitizeImage(profile.image);
    return toPublicUser(existing);
  }

  const user: StoredUser = {
    id: randomUUID(),
    email,
    passwordHash: hashPassword(randomBytes(32).toString("hex")),
    activeProducts: [],
    plan: "free",
    name: sanitizeName(profile.name),
    image: sanitizeImage(profile.image),
    createdAt: new Date(),
  };
  remember(user);
  return toPublicUser(user);
}

export function findUserByEmail(email: string): PublicUser | null {
  const user = usersByEmail.get(email.trim().toLowerCase());
  return user ? toPublicUser(user) : null;
}

export function sessionClaimsForUser(user: PublicUser): SuiteSessionClaims {
  return toSessionClaims({
    userId: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    activeProducts: user.activeProducts,
    plan: user.plan,
  });
}
