/**
 * Sign-in providers rendered on the login page.
 *
 * Google is the standard provider. Admin access is not a separate login:
 * after any successful sign-in, an email listed in ADMIN_EMAILS receives
 * `role: "admin"` and `isAdmin: true` on `suite_session`.
 *
 * To add a provider later:
 * 1. Uncomment its slot below and set `enabled: true`.
 * 2. Add `hub/app/api/auth/<id>/route.ts` plus a callback route.
 * 3. Add a label under `login` in `hub/messages/ja.json` and `en.json`.
 * 4. Keep new providers from granting admin on their own. Admin stays an
 *    email check against ADMIN_EMAILS, and production admin sign-in is Google.
 *
 * Open slots:
 * - github: GitHub OAuth App. Scopes `read:user` and `user:email`.
 * - facebook: Facebook Login with the email permission.
 * - email: magic link or password. Use this for members only.
 */
export interface AuthProviderSlot {
  id: "google" | "github" | "facebook" | "email";
  enabled: boolean;
  /** Key under the `login` message namespace. */
  labelKey: "google" | "github" | "facebook" | "email";
}

export const authProviders: readonly AuthProviderSlot[] = [
  { id: "google", enabled: true, labelKey: "google" },
  // { id: "github", enabled: false, labelKey: "github" },
  // { id: "facebook", enabled: false, labelKey: "facebook" },
  // { id: "email", enabled: false, labelKey: "email" },
];

export function enabledAuthProviders(): readonly AuthProviderSlot[] {
  return authProviders.filter((provider) => provider.enabled);
}
