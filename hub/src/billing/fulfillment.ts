import type Stripe from "stripe";
import { getProductBundle, type AbVariant } from "../commerce/store";
import { grantProductAccess, grantProducts, type PublicUser } from "../db/users";

export interface PurchaseIntent {
  userId: string;
  entityType: "product" | "bundle";
  targetId: string;
  abTestId: string | null;
  variant: AbVariant | null;
}

export type FulfillmentResult =
  | { ok: true; user: PublicUser }
  | { ok: false; message: string; status: 404 };

const completedSessionIds = new Set<string>();

export function claimCompletedSession(sessionId: string): boolean {
  if (completedSessionIds.has(sessionId)) {
    return false;
  }
  completedSessionIds.add(sessionId);
  return true;
}

export function releaseCompletedSession(sessionId: string): void {
  completedSessionIds.delete(sessionId);
}

export function readPurchaseIntent(session: Stripe.Checkout.Session): PurchaseIntent | null {
  const metadata = session.metadata ?? {};
  const userId = metadata.user_id || metadata.userId || session.client_reference_id || "";
  const targetId = metadata.target_id || metadata.targetProduct || "";
  if (userId.length === 0 || targetId.length === 0) {
    return null;
  }

  const entityType = metadata.entity_type === "bundle" ? "bundle" : "product";
  const abTestId = metadata.ab_test_id?.trim() || null;
  const variant = metadata.ab_variant === "A" || metadata.ab_variant === "B" ? metadata.ab_variant : null;
  return {
    userId,
    entityType,
    targetId,
    abTestId: abTestId && variant ? abTestId : null,
    variant: abTestId && variant ? variant : null,
  };
}

export async function fulfillPurchase(intent: PurchaseIntent): Promise<FulfillmentResult> {
  if (intent.entityType === "bundle") {
    const bundle = await getProductBundle(intent.targetId);
    if (!bundle) {
      return { ok: false, message: "バンドルが見つかりません", status: 404 };
    }
    const user = grantProducts(intent.userId, bundle.includedProductIds);
    if (!user) {
      return { ok: false, message: "ユーザーが見つかりません", status: 404 };
    }
    return { ok: true, user };
  }

  const user = grantProductAccess(intent.userId, intent.targetId);
  if (!user) {
    return { ok: false, message: "ユーザーが見つかりません", status: 404 };
  }
  return { ok: true, user };
}
