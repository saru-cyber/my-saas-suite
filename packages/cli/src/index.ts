import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

interface InternalSecrets {
  hubJwtSecret: string;
  app1InternalApiKey: string;
}

interface EnvFile {
  relativePath: string;
  contents: string;
}

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

function generateSecret(): string {
  return randomBytes(32).toString("hex");
}

function createSecrets(): InternalSecrets {
  return {
    hubJwtSecret: generateSecret(),
    app1InternalApiKey: generateSecret(),
  };
}

function buildHubEnv(secrets: InternalSecrets): string {
  return `# ドメイン設定（本番では .your-suite.com）
NEXT_PUBLIC_HUB_URL="http://localhost:3000"
COOKIE_DOMAIN="localhost"

# 外部サービス（手動設定・ダミー値）
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/saas_hub?schema=public"
STRIPE_SECRET_KEY="sk_test_YOUR_STRIPE_SECRET_KEY"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_STRIPE_PUBLISHABLE_KEY"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET"

# 内部接続用（CLIがリアルな乱数を自動生成）
HUB_JWT_SECRET="${secrets.hubJwtSecret}"
APP1_INTERNAL_API_KEY="${secrets.app1InternalApiKey}"
`;
}

function buildApp1Env(secrets: InternalSecrets): string {
  return `PRODUCT_ID="app1"
NEXT_PUBLIC_HUB_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
COOKIE_DOMAIN="localhost"

# Hubから自動引き継ぎされる内部共通鍵
HUB_JWT_SECRET="${secrets.hubJwtSecret}"
INTERNAL_API_KEY="${secrets.app1InternalApiKey}"

# マーケティング & SEO（手動設定・ダミー値）
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-YOUR_GA_ID"
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION="YOUR_VERIFICATION_CODE"
`;
}

async function writeEnvFile(file: EnvFile): Promise<void> {
  const filePath = path.join(repoRoot, file.relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, file.contents, "utf8");
  console.log(`wrote ${file.relativePath}`);
}

async function main(): Promise<void> {
  const secrets = createSecrets();
  const files: EnvFile[] = [
    {
      relativePath: path.join("hub", ".env.local"),
      contents: buildHubEnv(secrets),
    },
    {
      relativePath: path.join("products", "app1", ".env.local"),
      contents: buildApp1Env(secrets),
    },
  ];

  for (const file of files) {
    await writeEnvFile(file);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "env generation failed";
  console.error(message);
  process.exitCode = 1;
});
