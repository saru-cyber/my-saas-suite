import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin({
  requestConfig: "./i18n/request.ts",
  experimental: {
    createMessagesDeclaration: "./messages/en.json",
  },
});

const nextConfig: NextConfig = {
  agentRules: false,
  transpilePackages: ["@my-saas-suite/ui", "@my-saas-suite/legal"],
  outputFileTracingIncludes: {
    "/[locale]/legal/[slug]": ["../packages/legal/content/**/*.md"],
  },
};

export default withNextIntl(nextConfig);
