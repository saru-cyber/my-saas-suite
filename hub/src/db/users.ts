import { randomUUID } from "node:crypto";
import { hashPassword, verifyPassword } from "../auth/password";
import type { User } from "./schema";

export interface PublicUser {
  id: string;
  email: string;
  activeProducts: string[];
  plan: string;
  createdAt: Date;
}

type UserResult =
  | { ok: true; user: PublicUser }
  | { ok: false; message: string; status: 409 };

const usersByEmail = new Map<string, User>();
const usersById = new Map<string, User>();

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    activeProducts: user.activeProducts,
    plan: user.plan,
    createdAt: user.createdAt,
  };
}

function remember(user: User): void {
  usersByEmail.set(user.email, user);
  usersById.set(user.id, user);
}

function seedDemoUser(): void {
  const email = "demo@example.com";
  remember({
    id: "00000000-0000-4000-8000-000000000001",
    email,
    passwordHash: hashPassword("password"),
    activeProducts: [],
    plan: "free",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  });
}

seedDemoUser();

export function registerUser(email: string, password: string): UserResult {
  if (usersByEmail.has(email)) {
    return { ok: false, message: "このメールアドレスは登録済みです", status: 409 };
  }

  const user: User = {
    id: randomUUID(),
    email,
    passwordHash: hashPassword(password),
    activeProducts: [],
    plan: "free",
    createdAt: new Date(),
  };
  remember(user);
  return { ok: true, user: toPublicUser(user) };
}

export function grantProductAccess(userId: string, productId: string): PublicUser | null {
  const user = usersById.get(userId);
  if (!user) {
    return null;
  }

  if (!user.activeProducts.includes(productId)) {
    user.activeProducts = [...user.activeProducts, productId];
  }
  user.plan = "pro";
  return toPublicUser(user);
}

export function authenticateUser(email: string, password: string): PublicUser | null {
  const user = usersByEmail.get(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return null;
  }
  return toPublicUser(user);
}
