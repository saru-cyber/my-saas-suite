/**
 * Default dummy LP content for a fictional B2B SaaS ("Flowdesk", a workflow
 * automation tool). Copy this file to `config/lp-content.ts` in an app and
 * replace the text — every section of the shared LP is driven by it.
 */
import type { LPContent, LPContentByLocale, LPLocale } from "./types";

export const defaultLpContentJa: LPContent = {
  hero: {
    badge: "業務自動化プラットフォーム",
    title: "定型業務を、チームの手から解放する。",
    subtitle:
      "Flowdesk は承認・集計・通知といった繰り返し作業をノーコードで自動化。現場が本来の仕事に集中できる環境を、最短1日で整えます。",
    primaryCta: { label: "無料で始める", href: "/dashboard" },
    secondaryCta: { label: "導入事例を見る", href: "#case-studies" },
  },
  metrics: [
    { value: "1,200社+", label: "導入企業数" },
    { value: "68%", label: "定型業務の平均削減率" },
    { value: "99.95%", label: "稼働率（SLA）" },
    { value: "4.8 / 5", label: "顧客満足度" },
  ],
  features: [
    {
      title: "ノーコードのワークフロー設計",
      description: "ドラッグ&ドロップで承認フローや条件分岐を構築。エンジニアの手を借りずに現場で改善を回せます。",
      iconName: "Workflow",
    },
    {
      title: "既存ツールとの連携",
      description: "Slack、Google Workspace、Salesforce など主要サービスと標準連携。データの二重入力をなくします。",
      iconName: "Plug",
    },
    {
      title: "リアルタイム分析",
      description: "処理件数やボトルネックをダッシュボードで可視化。改善の効果を数字で確認できます。",
      iconName: "ChartColumn",
    },
    {
      title: "エンタープライズ水準のセキュリティ",
      description: "SSO、IP制限、監査ログに対応。権限は部署・役職単位できめ細かく管理できます。",
      iconName: "ShieldCheck",
    },
    {
      title: "テンプレートライブラリ",
      description: "経費精算・稟議・入社手続きなど、すぐに使える50以上のテンプレートを用意しています。",
      iconName: "LayoutTemplate",
    },
    {
      title: "日本語サポート",
      description: "導入から定着まで専任チームが伴走。チャットとオンライン会議で迅速に対応します。",
      iconName: "Headset",
    },
  ],
  steps: [
    {
      stepNumber: "01",
      title: "アカウントを作成",
      description: "メールアドレスだけで登録完了。クレジットカードは不要で、14日間すべての機能をお試しいただけます。",
    },
    {
      stepNumber: "02",
      title: "テンプレートを選んで設定",
      description: "業務に近いテンプレートを選び、項目や承認者を調整するだけ。既存ツールとの連携も数クリックです。",
    },
    {
      stepNumber: "03",
      title: "チームに展開",
      description: "メンバーを招待して運用開始。ダッシュボードで効果を確認しながら、改善を重ねていけます。",
    },
  ],
  caseStudies: [
    {
      id: "kitamura-logistics",
      company: "北村ロジスティクス株式会社",
      industry: "物流",
      metric: "月間作業時間を40時間削減",
      challenge:
        "配車依頼と請求書発行を表計算ソフトとメールで管理しており、転記ミスと確認作業に毎月多くの時間を費やしていました。",
      solution:
        "受付から請求までを1本のワークフローに統合。転記作業がなくなり、月40時間の工数削減とミス件数ゼロを実現しました。",
      quote:
        "現場の担当者が自分たちでフローを直せるようになったのが一番大きい変化です。改善のスピードがまったく違います。",
      author: "業務推進部 部長 北村 健太",
    },
    {
      id: "aozora-clinic",
      company: "医療法人 あおぞら会",
      industry: "医療",
      metric: "稟議の承認リードタイムを1/3に短縮",
      challenge:
        "紙の稟議書が複数拠点を回覧するため、承認まで平均9日かかり、備品調達が診療に影響することもありました。",
      solution:
        "モバイル承認と自動リマインドを導入し、承認リードタイムを平均3日に短縮。進捗も一覧で把握できるようになりました。",
      quote: "院長が外出先から承認できるようになり、待ち時間のストレスが大きく減りました。",
      author: "事務局 総務課 主任 佐藤 美咲",
    },
    {
      id: "nexa-software",
      company: "株式会社ネクサソフト",
      industry: "IT・ソフトウェア",
      metric: "入社手続きの工数を75%削減",
      challenge:
        "採用拡大に伴い入社手続きが急増。アカウント発行や備品手配の依頼が属人化し、漏れが発生していました。",
      solution:
        "入社日を起点にタスクを自動生成し各部署へ通知。手続き工数を75%削減し、初日から業務を開始できる体制を整えました。",
      quote: "毎月20名以上の入社があっても、人事が1人で回せるようになりました。",
      author: "人事部 マネージャー 高橋 翔",
    },
  ],
  pricing: {
    singlePlan: {
      name: "Flowdesk 単体プラン",
      price: "¥4,980",
      period: "/ 月",
      features: ["ワークフロー無制限", "主要ツール連携", "分析ダッシュボード", "メールサポート"],
      ctaLabel: "14日間無料で試す",
      ctaHref: "/dashboard",
    },
    bundlePlan: {
      name: "Suite バンドル",
      price: "¥9,800",
      period: "/ 月",
      features: [
        "Suite の全プロダクトが利用可能",
        "シングルサインオンで横断利用",
        "請求・アカウントを一元管理",
        "優先サポート",
      ],
      ctaLabel: "バンドルを始める",
      ctaHref: "/dashboard",
    },
  },
  faqs: [
    {
      question: "無料トライアル期間中に料金は発生しますか？",
      answer: "発生しません。14日間はすべての機能を無料でお使いいただけ、期間終了後に自動で課金されることもありません。",
    },
    {
      question: "途中でプランを変更・解約できますか？",
      answer: "いつでもアカウント画面から変更・解約できます。変更は日割りで計算され、解約後も当月末までご利用いただけます。",
    },
    {
      question: "単体プランから Suite バンドルへ切り替えられますか？",
      answer: "はい。切り替え時は既存プランの残り期間分を差し引いて請求されるため、二重に料金が発生することはありません。",
    },
    {
      question: "データのセキュリティはどのように確保されていますか？",
      answer: "通信と保存データはすべて暗号化しています。SSO・IP制限・監査ログにも対応し、定期的に第三者による脆弱性診断を実施しています。",
    },
    {
      question: "請求書払いに対応していますか？",
      answer: "年間契約のお客様は請求書払いをご選択いただけます。詳細はお問い合わせください。",
    },
  ],
  closingCta: {
    title: "繰り返し作業は、今日で終わりにしましょう。",
    subtitle: "登録は1分。クレジットカード不要で、すべての機能を14日間お試しいただけます。",
    buttonLabel: "無料で始める",
    buttonHref: "/dashboard",
  },
};

export const defaultLpContentEn: LPContent = {
  hero: {
    badge: "Workflow automation",
    title: "Take repetitive work off your team's plate.",
    subtitle:
      "Flowdesk automates approvals, reporting, and notifications without code — so your team can focus on the work that matters, starting the same day.",
    primaryCta: { label: "Start for free", href: "/dashboard" },
    secondaryCta: { label: "See customer stories", href: "#case-studies" },
  },
  metrics: [
    { value: "1,200+", label: "Companies onboard" },
    { value: "68%", label: "Average reduction in manual work" },
    { value: "99.95%", label: "Uptime SLA" },
    { value: "4.8 / 5", label: "Customer satisfaction" },
  ],
  features: [
    {
      title: "No-code workflow builder",
      description: "Design approval chains and conditional branches with drag and drop. Teams improve processes without waiting on engineering.",
      iconName: "Workflow",
    },
    {
      title: "Integrations that just work",
      description: "Native connectors for Slack, Google Workspace, Salesforce, and more eliminate double entry across tools.",
      iconName: "Plug",
    },
    {
      title: "Real-time analytics",
      description: "Track throughput and spot bottlenecks on a live dashboard, and measure the impact of every change.",
      iconName: "ChartColumn",
    },
    {
      title: "Enterprise-grade security",
      description: "SSO, IP allowlists, and audit logs come standard, with fine-grained permissions by team and role.",
      iconName: "ShieldCheck",
    },
    {
      title: "Template library",
      description: "Start from 50+ ready-made templates for expenses, purchase requests, onboarding, and more.",
      iconName: "LayoutTemplate",
    },
    {
      title: "Dedicated support",
      description: "A specialist team guides you from setup to adoption over chat and video calls.",
      iconName: "Headset",
    },
  ],
  steps: [
    {
      stepNumber: "01",
      title: "Create your account",
      description: "Sign up with just your email. No credit card required — every feature is unlocked for 14 days.",
    },
    {
      stepNumber: "02",
      title: "Pick a template and configure",
      description: "Choose a template close to your process, adjust fields and approvers, and connect your tools in a few clicks.",
    },
    {
      stepNumber: "03",
      title: "Roll it out to your team",
      description: "Invite teammates and go live. Use the dashboard to measure results and keep improving.",
    },
  ],
  caseStudies: [
    {
      id: "kitamura-logistics",
      company: "Kitamura Logistics",
      industry: "Logistics",
      metric: "40 hours saved every month",
      challenge:
        "Dispatch requests and invoicing were tracked in spreadsheets and email, and re-keying data led to errors and hours of manual checks each month.",
      solution:
        "Intake through invoicing now runs as a single workflow. Manual transcription is gone, saving 40 hours a month with zero data-entry errors.",
      quote:
        "The biggest change is that our operations staff can fix workflows themselves. We improve at a completely different pace now.",
      author: "Kenta Kitamura, Head of Operations",
    },
    {
      id: "aozora-clinic",
      company: "Aozora Medical Group",
      industry: "Healthcare",
      metric: "Approval lead time cut by two-thirds",
      challenge:
        "Paper purchase requests circulated across several clinics, taking nine days on average to approve and sometimes delaying supplies.",
      solution:
        "Mobile approvals and automatic reminders brought average lead time down to three days, with status visible in one place.",
      quote: "Our director can approve requests on the go, and the frustration of waiting has largely disappeared.",
      author: "Misaki Sato, General Affairs Lead",
    },
    {
      id: "nexa-software",
      company: "Nexa Software",
      industry: "Software",
      metric: "75% less effort on employee onboarding",
      challenge:
        "Rapid hiring flooded HR with onboarding work. Account setup and equipment requests depended on individuals, and steps were missed.",
      solution:
        "Tasks are now generated from each start date and routed to the right teams automatically, cutting onboarding effort by 75%.",
      quote: "Even with 20+ new hires a month, one HR person can handle onboarding end to end.",
      author: "Sho Takahashi, HR Manager",
    },
  ],
  pricing: {
    singlePlan: {
      name: "Flowdesk",
      price: "$39",
      period: "/ month",
      features: ["Unlimited workflows", "Core integrations", "Analytics dashboard", "Email support"],
      ctaLabel: "Start 14-day free trial",
      ctaHref: "/dashboard",
    },
    bundlePlan: {
      name: "Suite Bundle",
      price: "$79",
      period: "/ month",
      features: [
        "Every product in the Suite",
        "Single sign-on across apps",
        "Unified billing and accounts",
        "Priority support",
      ],
      ctaLabel: "Get the bundle",
      ctaHref: "/dashboard",
    },
  },
  faqs: [
    {
      question: "Will I be charged during the free trial?",
      answer: "No. Every feature is free for 14 days, and you won't be billed automatically when the trial ends.",
    },
    {
      question: "Can I change or cancel my plan at any time?",
      answer: "Yes, from your account page. Changes are prorated, and after cancelling you keep access until the end of the billing period.",
    },
    {
      question: "Can I upgrade from a single plan to the Suite Bundle?",
      answer: "Yes. The unused portion of your current plan is credited, so you're never charged twice.",
    },
    {
      question: "How is my data protected?",
      answer: "All data is encrypted in transit and at rest. We support SSO, IP allowlists, and audit logs, and run regular third-party security assessments.",
    },
    {
      question: "Do you support invoice billing?",
      answer: "Invoice billing is available on annual contracts. Contact us for details.",
    },
  ],
  closingCta: {
    title: "Make today the last day of repetitive work.",
    subtitle: "Sign up in a minute. No credit card required — try every feature free for 14 days.",
    buttonLabel: "Start for free",
    buttonHref: "/dashboard",
  },
};

export const defaultLpContent: LPContentByLocale = {
  ja: defaultLpContentJa,
  en: defaultLpContentEn,
};

/** Returns the dummy content for `locale`, falling back to English. */
export function getDefaultLpContent(locale: string): LPContent {
  return locale === "ja" ? defaultLpContentJa : defaultLpContentEn;
}

export type { LPLocale };
