/**
 * Hub (Suite platform) landing page copy. Edit the text below to change the LP;
 * the page component (`app/[locale]/page.tsx`) never needs to change.
 * Field reference: `LPContent` in @my-saas-suite/ui/landing.
 */
import type { LPContent, LPLocale } from "@my-saas-suite/ui/landing";

function hubLpContentJa(): LPContent {
  return {
    hero: {
      badge: "B2B SaaS スイート",
      title: "チームの業務アプリを、ひとつのアカウントで。",
      subtitle:
        "Suite は、業務に必要なプロダクトをシングルサインオンと一元請求でまとめたプラットフォームです。必要なアプリから始めて、チームの成長に合わせて広げられます。",
      primaryCta: { label: "無料で始める", href: "/ja/login" },
      secondaryCta: { label: "導入事例を見る", href: "#case-studies" },
    },
    metrics: [
      { value: "1,200社+", label: "導入企業数" },
      { value: "1アカウント", label: "全プロダクトに共通ログイン" },
      { value: "99.95%", label: "稼働率（SLA）" },
      { value: "4.8 / 5", label: "顧客満足度" },
    ],
    features: [
      {
        title: "シングルサインオン",
        description: "一度のログインで Suite のすべてのプロダクトへ。アプリごとにパスワードを管理する必要はありません。",
        iconName: "KeyRound",
      },
      {
        title: "請求とプランを一元管理",
        description: "契約中のプロダクト、プラン、請求書を Hub でまとめて確認。経理の手間を減らします。",
        iconName: "ReceiptText",
      },
      {
        title: "バンドルでお得に",
        description: "複数のプロダクトを使うなら Suite バンドル。単体契約を積み上げるより低いコストで全アプリを利用できます。",
        iconName: "Layers",
      },
      {
        title: "管理者向けコントロール",
        description: "メンバーの権限や利用状況を管理画面から把握。組織の規模が大きくなっても統制を保てます。",
        iconName: "ShieldCheck",
      },
      {
        title: "自社ブランドに合わせた外観",
        description: "ロゴやアクセントカラー、ライト/ダークの表示を設定し、全プロダクトに反映できます。",
        iconName: "Palette",
      },
      {
        title: "日本語・英語に対応",
        description: "すべての画面が日本語と英語に対応。海外拠点のメンバーとも同じ環境で働けます。",
        iconName: "Languages",
      },
    ],
    steps: [
      {
        stepNumber: "01",
        title: "Suite アカウントを作成",
        description: "メールアドレスで登録するだけ。クレジットカードは不要です。",
      },
      {
        stepNumber: "02",
        title: "使うプロダクトを選ぶ",
        description: "必要なアプリを単体で契約するか、バンドルですべてを有効にします。",
      },
      {
        stepNumber: "03",
        title: "チームを招待",
        description: "メンバーを招待すれば、同じアカウントで全プロダクトをすぐに使い始められます。",
      },
    ],
    caseStudies: [
      {
        id: "kitamura-logistics",
        company: "北村ロジスティクス株式会社",
        industry: "物流",
        metric: "ツール費用を年間28%削減",
        challenge:
          "部署ごとに別々の SaaS を契約しており、アカウント管理と請求処理が分散。退職者のアカウント削除漏れも課題でした。",
        solution:
          "Suite バンドルに集約し、アカウントと請求を Hub で一元化。ツール費用を28%削減し、権限管理の漏れもなくなりました。",
        quote: "請求書が1枚になっただけでも経理の負担は大きく変わりました。アカウントの棚卸しも数分で終わります。",
        author: "管理本部 部長 北村 健太",
      },
      {
        id: "aozora-clinic",
        company: "医療法人 あおぞら会",
        industry: "医療",
        metric: "ログイン関連の問い合わせを90%削減",
        challenge: "複数拠点のスタッフがアプリごとに異なるパスワードを使っており、ログインできないという問い合わせが絶えませんでした。",
        solution: "シングルサインオンへ切り替え、スタッフは1つのアカウントで全アプリを利用。問い合わせ件数は9割減りました。",
        quote: "IT 担当は私ひとりなので、パスワード対応から解放されたのは本当に助かっています。",
        author: "事務局 情報システム担当 佐藤 美咲",
      },
      {
        id: "nexa-software",
        company: "株式会社ネクサソフト",
        industry: "IT・ソフトウェア",
        metric: "新メンバーの準備時間を1日から15分に",
        challenge: "入社のたびに複数のツールでアカウントを発行する必要があり、初日に業務を始められないことがありました。",
        solution: "Suite に招待するだけで必要なプロダクトがすべて使える状態に。準備にかかる時間を15分まで短縮しました。",
        quote: "招待メールを送れば終わり。毎月の入社対応がほとんど手間にならなくなりました。",
        author: "人事部 マネージャー 高橋 翔",
      },
    ],
    pricing: {
      singlePlan: {
        name: "プロダクト単体",
        price: "¥4,980〜",
        period: "/ 月",
        features: ["必要なプロダクトだけを契約", "シングルサインオン", "Hub での請求・プラン管理", "メールサポート"],
        ctaLabel: "無料で始める",
        ctaHref: "/ja/login",
      },
      bundlePlan: {
        name: "Suite バンドル",
        price: "¥9,800",
        period: "/ 月",
        features: [
          "Suite の全プロダクトが利用可能",
          "今後追加されるプロダクトも追加料金なし",
          "請求・アカウントを一元管理",
          "優先サポート",
        ],
        ctaLabel: "バンドルを始める",
        ctaHref: "/ja/login",
      },
    },
    faqs: [
      {
        question: "Suite アカウントだけで、すべてのプロダクトを使えますか？",
        answer: "はい。ログインは Suite で共通です。利用できるプロダクトは、契約中のプランに応じて自動で有効になります。",
      },
      {
        question: "単体プランから Suite バンドルへ切り替えられますか？",
        answer: "いつでも切り替えられます。既存プランの残り期間分は差し引いて請求されるため、二重に料金が発生することはありません。",
      },
      {
        question: "請求書は1通にまとめられますか？",
        answer: "はい。契約中のすべてのプロダクトは Hub でまとめて請求され、請求書も Hub から確認できます。",
      },
      {
        question: "途中で解約できますか？",
        answer: "Hub のアカウント画面からいつでも解約できます。解約後も当月末までご利用いただけます。",
      },
      {
        question: "データのセキュリティはどのように確保されていますか？",
        answer: "通信と保存データはすべて暗号化しています。権限管理と監査ログにも対応しています。",
      },
    ],
    closingCta: {
      title: "チームのツールを、Suite ひとつに。",
      subtitle: "登録は1分。クレジットカード不要で始められます。",
      buttonLabel: "無料で始める",
      buttonHref: "/ja/login",
    },
  };
}

function hubLpContentEn(): LPContent {
  return {
    hero: {
      badge: "B2B SaaS suite",
      title: "All your team's business apps, one account.",
      subtitle:
        "Suite brings the products your team relies on together with single sign-on and unified billing. Start with the app you need and expand as your team grows.",
      primaryCta: { label: "Start for free", href: "/en/login" },
      secondaryCta: { label: "See customer stories", href: "#case-studies" },
    },
    metrics: [
      { value: "1,200+", label: "Companies onboard" },
      { value: "1 account", label: "Shared sign-in for every product" },
      { value: "99.95%", label: "Uptime SLA" },
      { value: "4.8 / 5", label: "Customer satisfaction" },
    ],
    features: [
      {
        title: "Single sign-on",
        description: "Sign in once to reach every product in the Suite. No separate passwords for each app.",
        iconName: "KeyRound",
      },
      {
        title: "Unified billing and plans",
        description: "See every subscription, plan, and invoice in the Hub, and spend less time reconciling bills.",
        iconName: "ReceiptText",
      },
      {
        title: "Save with the bundle",
        description: "Using more than one product? The Suite Bundle unlocks every app for less than stacking single plans.",
        iconName: "Layers",
      },
      {
        title: "Admin controls",
        description: "Manage member roles and usage from one console, and stay in control as your organization grows.",
        iconName: "ShieldCheck",
      },
      {
        title: "Your brand, everywhere",
        description: "Set your logo, accent color, and light or dark appearance once and apply it across products.",
        iconName: "Palette",
      },
      {
        title: "English and Japanese",
        description: "Every screen is available in English and Japanese, so distributed teams share the same workspace.",
        iconName: "Languages",
      },
    ],
    steps: [
      {
        stepNumber: "01",
        title: "Create a Suite account",
        description: "Sign up with your email. No credit card required.",
      },
      {
        stepNumber: "02",
        title: "Choose your products",
        description: "Subscribe to the apps you need, or turn on everything with the bundle.",
      },
      {
        stepNumber: "03",
        title: "Invite your team",
        description: "Invited members can use every product right away with the same account.",
      },
    ],
    caseStudies: [
      {
        id: "kitamura-logistics",
        company: "Kitamura Logistics",
        industry: "Logistics",
        metric: "28% lower annual tool spend",
        challenge:
          "Each department bought its own SaaS tools, scattering accounts and invoices. Accounts for departed staff were often left active.",
        solution:
          "Consolidating on the Suite Bundle put accounts and billing in the Hub, cutting tool spend by 28% and closing access gaps.",
        quote: "Going to a single invoice alone changed our finance workload. Account reviews now take minutes.",
        author: "Kenta Kitamura, Head of Administration",
      },
      {
        id: "aozora-clinic",
        company: "Aozora Medical Group",
        industry: "Healthcare",
        metric: "90% fewer sign-in support requests",
        challenge: "Staff across several clinics juggled a different password for every app, and sign-in tickets never stopped.",
        solution: "With single sign-on, staff use one account for every app, and sign-in requests dropped by 90%.",
        quote: "I'm the only IT person here, so getting out of password resets has been a huge relief.",
        author: "Misaki Sato, IT Administrator",
      },
      {
        id: "nexa-software",
        company: "Nexa Software",
        industry: "Software",
        metric: "New-hire setup from a day to 15 minutes",
        challenge: "Every new hire needed accounts in several tools, and some couldn't start work on day one.",
        solution: "A single Suite invite now gives new hires every product they need, cutting setup to 15 minutes.",
        quote: "Send the invite and you're done. Monthly onboarding is barely any work now.",
        author: "Sho Takahashi, HR Manager",
      },
    ],
    pricing: {
      singlePlan: {
        name: "Single product",
        price: "From $39",
        period: "/ month",
        features: ["Subscribe only to what you need", "Single sign-on", "Billing and plans in the Hub", "Email support"],
        ctaLabel: "Start for free",
        ctaHref: "/en/login",
      },
      bundlePlan: {
        name: "Suite Bundle",
        price: "$79",
        period: "/ month",
        features: [
          "Every product in the Suite",
          "New products included at no extra cost",
          "Unified billing and accounts",
          "Priority support",
        ],
        ctaLabel: "Get the bundle",
        ctaHref: "/en/login",
      },
    },
    faqs: [
      {
        question: "Can I use every product with just a Suite account?",
        answer: "Yes. Sign-in is shared across the Suite, and products are enabled automatically based on your plan.",
      },
      {
        question: "Can I switch from a single plan to the Suite Bundle?",
        answer: "Any time. The unused portion of your current plan is credited, so you're never charged twice.",
      },
      {
        question: "Can I get a single invoice?",
        answer: "Yes. All of your subscriptions are billed together in the Hub, where you can also view invoices.",
      },
      {
        question: "Can I cancel at any time?",
        answer: "Yes, from your account page in the Hub. You keep access until the end of the billing period.",
      },
      {
        question: "How is my data protected?",
        answer: "All data is encrypted in transit and at rest, with role-based permissions and audit logs.",
      },
    ],
    closingCta: {
      title: "Bring your team's tools together in Suite.",
      subtitle: "Sign up in a minute. No credit card required.",
      buttonLabel: "Start for free",
      buttonHref: "/en/login",
    },
  };
}

export function getHubLpContent(locale: LPLocale): LPContent {
  return locale === "ja" ? hubLpContentJa() : hubLpContentEn();
}
