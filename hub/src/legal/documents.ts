import type { AppLocale } from "../../i18n/routing";

export const LEGAL_TABS = ["terms", "privacy", "merchant", "email"] as const;

export type LegalTab = (typeof LEGAL_TABS)[number];

export function isLegalTab(value: string): value is LegalTab {
  return LEGAL_TABS.some((tab) => tab === value);
}

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export interface LegalField {
  label: string;
  value: string;
}

/** Add a product by appending an entry. Suite common terms stay unchanged. */
export interface ProductTerms {
  id: string;
  name: string;
  sections: LegalSection[];
}

export interface LegalCopy {
  title: string;
  disclaimer: string;
  tabListLabel: string;
  tabs: Record<LegalTab, string>;
  terms: {
    commonHeading: string;
    commonLead: string;
    operatorHeading: string;
    operator: LegalField[];
    common: LegalSection[];
    productsHeading: string;
    productsLead: string;
    products: ProductTerms[];
  };
  privacy: {
    heading: string;
    intro: string;
    fields: LegalField[];
    sections: LegalSection[];
  };
  merchant: {
    heading: string;
    intro: string;
    fields: LegalField[];
    sections: LegalSection[];
  };
  email: {
    heading: string;
    intro: string;
    fields: LegalField[];
    sections: LegalSection[];
  };
}

const operatorEn: LegalField[] = [
  { label: "Name", value: "[EDIT_REQUIRED: legal entity name]" },
  { label: "Representative", value: "[EDIT_REQUIRED: representative name]" },
  { label: "Address", value: "[EDIT_REQUIRED: business address]" },
  { label: "Contact", value: "[EDIT_REQUIRED: contact email]" },
  { label: "Phone", value: "[EDIT_REQUIRED: phone number]" },
];

const operatorJa: LegalField[] = [
  { label: "事業者名", value: "[EDIT_REQUIRED: 運営会社名]" },
  { label: "代表者", value: "[EDIT_REQUIRED: 代表者名]" },
  { label: "所在地", value: "[EDIT_REQUIRED: 所在地]" },
  { label: "連絡先", value: "[EDIT_REQUIRED: 連絡先メールアドレス]" },
  { label: "電話番号", value: "[EDIT_REQUIRED: 電話番号]" },
];

const documentsEn: LegalCopy = {
  title: "Legal",
  disclaimer:
    "⚠️ This document is a prototype reference. A legal review by a qualified attorney is required before production use.",
  tabListLabel: "Legal documents",
  tabs: {
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    merchant: "Commercial Disclosure",
    email: "Specified Commercial Email Act",
  },
  terms: {
    commonHeading: "Suite common terms",
    commonLead: "These terms apply to the Suite account and to every product that belongs to it.",
    operatorHeading: "Operator",
    operator: operatorEn,
    common: [
      {
        heading: "1. Scope",
        paragraphs: [
          "These terms govern use of the Suite and the products that belong to it. Creating an account or signing in means the user agrees to these common terms and to the product-specific provisions for each product they use.",
        ],
      },
      {
        heading: "2. Accounts",
        paragraphs: [
          "Hub registers the Suite account. The user must keep the email address and other registration details accurate and is responsible for activity under the account, including credentials and invited members.",
        ],
      },
      {
        heading: "3. Shared session",
        paragraphs: [
          "Hub issues a shared session cookie named suite_session. A signed-in user can open each subscribed product without a separate password. Signing out of Hub ends that shared session. A product may read the session to confirm identity, plan, and active products, and must not use it for any other purpose.",
        ],
      },
      {
        heading: "4. Fees, payment, and subscriptions",
        paragraphs: [
          "Paid plans are billed through Stripe. The price is the amount shown for the selected product or bundle. A subscription continues until the user cancels it.",
          "[EDIT_REQUIRED: payment timing, billing method, taxes, and late payment]",
          "Refunds: [EDIT_REQUIRED: refund policy]",
        ],
      },
      {
        heading: "5. Prohibited conduct",
        paragraphs: [
          "Illegal use and infringement of our rights or the rights of others are prohibited. Interfering with the Suite, other users, or a product's limits is also prohibited.",
        ],
      },
      {
        heading: "6. Disclaimer and damages",
        paragraphs: [
          "Except where liability cannot legally be excluded, we are not liable for interruptions, data loss, or disputes with other users or third parties.",
          "[EDIT_REQUIRED: cap on damages]",
        ],
      },
      {
        heading: "7. Cancellation",
        paragraphs: ["[EDIT_REQUIRED: cancellation terms and contract term]"],
      },
      {
        heading: "8. Governing law",
        paragraphs: ["[EDIT_REQUIRED: governing law and venue]"],
      },
    ],
    productsHeading: "Product-specific provisions",
    productsLead:
      "Each block below applies only to the named product and supplements the Suite common terms. If a product provision conflicts with the common terms, the product provision governs for that product.",
    products: [
      {
        id: "app1",
        name: "App1",
        sections: [
          {
            heading: "Service conditions",
            paragraphs: [
              "App1 is provided under the plan shown on Hub. Features available to the user follow the subscribed plan.",
              "[EDIT_REQUIRED: App1 service description, availability, and support hours]",
            ],
          },
          {
            heading: "Data retention",
            paragraphs: [
              "[EDIT_REQUIRED: how long App1 keeps customer content after cancellation, and what is deleted or exported]",
            ],
          },
          {
            heading: "API limits",
            paragraphs: [
              "[EDIT_REQUIRED: App1 API rate limits, fair-use rules, and what happens when a limit is exceeded]",
            ],
          },
        ],
      },
    ],
  },
  privacy: {
    heading: "Privacy Policy",
    intro: "This policy describes how the Suite and its products handle personal information. Replace the placeholders before production use.",
    fields: [
      { label: "Controller", value: "[EDIT_REQUIRED: legal entity name]" },
      { label: "Contact", value: "[EDIT_REQUIRED: privacy contact email]" },
    ],
    sections: [
      {
        heading: "Information we collect",
        paragraphs: [
          "Hub collects the account email, password credential or sign-in identifier, plan, active products, and billing identifiers returned by Stripe. Each product may collect the content the user submits in that product.",
          "[EDIT_REQUIRED: product-specific categories of personal information]",
        ],
      },
      {
        heading: "How we use it",
        paragraphs: [
          "We use this information to provide the account, the shared session, billing, support, and the products the user has subscribed to.",
        ],
      },
      {
        heading: "Sharing",
        paragraphs: [
          "Payment data is processed by Stripe. We do not sell personal information.",
          "[EDIT_REQUIRED: other processors, and whether data is transferred outside the user's country]",
        ],
      },
      {
        heading: "Retention",
        paragraphs: [
          "Account and billing records are kept for as long as the account exists and for the period required by tax and accounting law.",
          "[EDIT_REQUIRED: retention period for product content]",
        ],
      },
      {
        heading: "Requests",
        paragraphs: [
          "The user may ask to access, correct, or delete personal information through the contact above, subject to records we must keep by law.",
        ],
      },
      {
        heading: "Cookies and the shared session",
        paragraphs: [
          "Hub stores suite_session so the user stays signed in across Hub and subscribed products. The cookie is required for the signed-in service.",
        ],
      },
      {
        heading: "Changes",
        paragraphs: ["We will post changes to this policy on this page. [EDIT_REQUIRED: how material changes are announced]"],
      },
    ],
  },
  merchant: {
    heading: "Specified Commercial Transactions Act Disclosure",
    intro: "The fields below are the disclosures required before selling to consumers in Japan. Replace every placeholder before taking payment.",
    fields: [
      { label: "Seller", value: "[EDIT_REQUIRED: legal entity name]" },
      { label: "Representative", value: "[EDIT_REQUIRED: representative name]" },
      { label: "Address", value: "[EDIT_REQUIRED: business address]" },
      { label: "Phone", value: "[EDIT_REQUIRED: phone number]" },
      { label: "Email", value: "[EDIT_REQUIRED: contact email]" },
      { label: "Price", value: "The price shown on the product page or at checkout, including tax. [EDIT_REQUIRED: tax treatment]" },
      { label: "Additional charges", value: "[EDIT_REQUIRED: charges beyond the product price, or “none”]" },
      { label: "Payment timing and method", value: "[EDIT_REQUIRED: when the user is charged, and the payment methods]" },
      { label: "Delivery", value: "Access to a subscribed product starts when checkout completes. [EDIT_REQUIRED: any delay]" },
    ],
    sections: [
      {
        heading: "Cancellation and refunds",
        paragraphs: ["[EDIT_REQUIRED: cancellation window, refunds, and how to send a cancellation request]"],
      },
      {
        heading: "Operating environment",
        paragraphs: ["[EDIT_REQUIRED: supported browsers or other environment the user needs]"],
      },
    ],
  },
  email: {
    heading: "Specified Commercial Email Act",
    intro: "These rules apply to advertising email sent by the Suite or a product. Transactional mail about an existing account or purchase is separate.",
    fields: [
      { label: "Sender", value: "[EDIT_REQUIRED: sender name]" },
      { label: "Address", value: "[EDIT_REQUIRED: sender address]" },
      { label: "Contact", value: "[EDIT_REQUIRED: sender contact email]" },
    ],
    sections: [
      {
        heading: "Advertising email",
        paragraphs: [
          "An advertising email must show that it is an advertisement, the sender's name and contact, and a way to opt out, in the message itself.",
        ],
      },
      {
        heading: "Opt-out",
        paragraphs: [
          "The recipient can stop advertising email without charge by using the method stated in the message.",
          "[EDIT_REQUIRED: opt-out address or page, and how quickly the stop takes effect]",
        ],
      },
      {
        heading: "After an opt-out",
        paragraphs: [
          "After a recipient opts out, we do not send that person further advertising email. A record of the opt-out is kept only to honor it.",
        ],
      },
      {
        heading: "Consent",
        paragraphs: [
          "[EDIT_REQUIRED: when advertising email is sent only with prior consent, and how consent was obtained]",
        ],
      },
    ],
  },
};

const documentsJa: LegalCopy = {
  title: "法務情報",
  disclaimer:
    "⚠️ 本ドキュメントはプロトタイプ用の参考資料であり、本番運用時は弁護士等の専門家によるリーガルチェックが必要です。",
  tabListLabel: "法務文書",
  tabs: {
    terms: "利用規約",
    privacy: "プライバシーポリシー",
    merchant: "特定商取引法に基づく表記",
    email: "特定電子メール法に基づく表記",
  },
  terms: {
    commonHeading: "Suite 共通利用規約",
    commonLead: "この共通規約は、Suite のアカウントと、Suite に属するすべてのプロダクトに適用されます。",
    operatorHeading: "事業者",
    operator: operatorJa,
    common: [
      {
        heading: "1. 適用",
        paragraphs: [
          "本規約は、Suite およびこれに属する各プロダクトの利用条件を定めます。アカウントの作成またはログインにより、利用者は本共通規約と、利用する各プロダクトの個別規定に同意したものとします。",
        ],
      },
      {
        heading: "2. アカウント",
        paragraphs: [
          "アカウントは Hub で作成します。利用者は、メールアドレスその他の登録情報を正確に保ち、認証情報や招待したメンバーを含め、アカウント上の行為について責任を負います。",
        ],
      },
      {
        heading: "3. 共通セッション",
        paragraphs: [
          "Hub は suite_session という共有セッション Cookie を発行します。ログインした利用者は、契約中のプロダクトを個別のパスワードなしで開けます。Hub からログアウトすると、この共有セッションは終了します。各プロダクトは、本人確認とプラン、契約中プロダクトの確認に限りセッションを読み取ることができ、それ以外の目的に使ってはなりません。",
        ],
      },
      {
        heading: "4. 料金、決済、サブスクリプション",
        paragraphs: [
          "有料プランは Stripe を通じて請求します。料金は、選択したプロダクトまたはバンドルに表示された金額です。サブスクリプションは、利用者が解約するまで継続します。",
          "[EDIT_REQUIRED: 支払時期、請求方法、税金、延滞時の扱い]",
          "返金: [EDIT_REQUIRED: 返金規定]",
        ],
      },
      {
        heading: "5. 禁止事項",
        paragraphs: [
          "法令または本規約に違反する行為、当社または第三者の権利を侵害する行為を禁止します。Suite、他の利用者、またはプロダクトの利用上限を妨害する行為も禁止します。",
        ],
      },
      {
        heading: "6. 免責と損害賠償",
        paragraphs: [
          "当社は、本サービスの中断、データの消失、利用者間または第三者との紛争について、法令で除外できない場合を除き責任を負いません。",
          "[EDIT_REQUIRED: 損害賠償額の上限]",
        ],
      },
      {
        heading: "7. 解約",
        paragraphs: ["[EDIT_REQUIRED: 解約条件と契約期間]"],
      },
      {
        heading: "8. 準拠法",
        paragraphs: ["[EDIT_REQUIRED: 準拠法と裁判管轄]"],
      },
    ],
    productsHeading: "プロダクト個別規定",
    productsLead:
      "以下の各ブロックは、そのプロダクトにだけ適用され、Suite 共通利用規約を補います。個別規定と共通規約が矛盾する場合、そのプロダクトについては個別規定が優先します。",
    products: [
      {
        id: "app1",
        name: "App1",
        sections: [
          {
            heading: "サービスの提供条件",
            paragraphs: [
              "App1 は、Hub に表示されたプランに従って提供します。利用できる機能は、契約中のプランに従います。",
              "[EDIT_REQUIRED: App1 のサービス内容、提供時間、サポート窓口]",
            ],
          },
          {
            heading: "データの保持期限",
            paragraphs: ["[EDIT_REQUIRED: 解約後に App1 が顧客データを保持する期間と、削除または書き出す方法]"],
          },
          {
            heading: "API の制限",
            paragraphs: ["[EDIT_REQUIRED: App1 の API レート制限、公正利用の条件、上限を超えたときの扱い]"],
          },
        ],
      },
    ],
  },
  privacy: {
    heading: "プライバシーポリシー",
    intro: "この方針は、Suite と各プロダクトが個人情報をどのように扱うかを示します。本番前にプレースホルダを置き換えてください。",
    fields: [
      { label: "管理者", value: "[EDIT_REQUIRED: 運営会社名]" },
      { label: "連絡先", value: "[EDIT_REQUIRED: プライバシー問い合わせ先]" },
    ],
    sections: [
      {
        heading: "取得する情報",
        paragraphs: [
          "Hub は、アカウントのメールアドレス、ログイン識別子、プラン、契約中プロダクト、および Stripe から返る請求識別子を取得します。各プロダクトは、利用者がそのプロダクトに入力した内容を取得することがあります。",
          "[EDIT_REQUIRED: プロダクトごとに取得する個人情報の区分]",
        ],
      },
      {
        heading: "利用目的",
        paragraphs: ["取得した情報は、アカウント、共有セッション、請求、サポート、および契約中のプロダクトの提供に使います。"],
      },
      {
        heading: "第三者への提供",
        paragraphs: [
          "決済情報は Stripe が処理します。個人情報を販売することはありません。",
          "[EDIT_REQUIRED: その他の委託先と、国外への移転の有無]",
        ],
      },
      {
        heading: "保持期間",
        paragraphs: [
          "アカウントと請求の記録は、アカウントが存続する間、および税法その他の法令が求める期間、保持します。",
          "[EDIT_REQUIRED: プロダクト上のコンテンツの保持期間]",
        ],
      },
      {
        heading: "開示などの請求",
        paragraphs: ["利用者は、上記の連絡先を通じて、個人情報の開示、訂正、削除を請求できます。法令上保持が必要な記録は対象外です。"],
      },
      {
        heading: "Cookie と共有セッション",
        paragraphs: [
          "Hub は、Hub と契約中プロダクトのあいだでログインを維持するため suite_session を保存します。この Cookie は、ログインしたサービスの提供に必要です。",
        ],
      },
      {
        heading: "変更",
        paragraphs: ["この方針を変更する場合は、本ページに掲載します。[EDIT_REQUIRED: 重要な変更の告知方法]"],
      },
    ],
  },
  merchant: {
    heading: "特定商取引法に基づく表記",
    intro: "以下は、日本の消費者向け販売の前に必要な表記です。決済を始める前に、すべてのプレースホルダを置き換えてください。",
    fields: [
      { label: "販売業者", value: "[EDIT_REQUIRED: 運営会社名]" },
      { label: "運営統括責任者", value: "[EDIT_REQUIRED: 代表者名]" },
      { label: "所在地", value: "[EDIT_REQUIRED: 所在地]" },
      { label: "電話番号", value: "[EDIT_REQUIRED: 電話番号]" },
      { label: "メールアドレス", value: "[EDIT_REQUIRED: 連絡先メールアドレス]" },
      { label: "販売価格", value: "各プロダクトのページまたは購入画面に税込で表示する金額。[EDIT_REQUIRED: 税の扱い]" },
      { label: "商品代金以外の必要料金", value: "[EDIT_REQUIRED: 商品代金以外の料金。ない場合はその旨]" },
      { label: "支払時期と方法", value: "[EDIT_REQUIRED: 課金の時期と、利用できる支払方法]" },
      { label: "役務の提供時期", value: "契約したプロダクトへのアクセスは、購入手続きの完了時に開始します。[EDIT_REQUIRED: 遅延がある場合]" },
    ],
    sections: [
      {
        heading: "解約と返金",
        paragraphs: ["[EDIT_REQUIRED: 解約期限、返金条件、解約の申出方法]"],
      },
      {
        heading: "動作環境",
        paragraphs: ["[EDIT_REQUIRED: 利用に必要なブラウザなどの環境]"],
      },
    ],
  },
  email: {
    heading: "特定電子メール法に基づく表記",
    intro: "この項目は、Suite または各プロダクトが送る広告宣伝メールに適用します。既存のアカウントや購入に関する取引メールは、広告宣伝メールとは別です。",
    fields: [
      { label: "送信者の名称", value: "[EDIT_REQUIRED: 送信者名]" },
      { label: "送信者の住所", value: "[EDIT_REQUIRED: 送信者の住所]" },
      { label: "問い合わせ先", value: "[EDIT_REQUIRED: 送信者の連絡先メールアドレス]" },
    ],
    sections: [
      {
        heading: "広告宣伝メールである旨",
        paragraphs: [
          "広告宣伝メールには、広告である旨、送信者の氏名または名称と連絡先、および配信停止の方法を、本文中に表示します。",
        ],
      },
      {
        heading: "配信停止（オプトアウト）",
        paragraphs: [
          "受信者は、メールに記載した方法で、無料で広告宣伝メールの配信を止められます。",
          "[EDIT_REQUIRED: 配信停止の宛先またはページと、停止が反映されるまでの期間]",
        ],
      },
      {
        heading: "配信停止のあと",
        paragraphs: [
          "配信停止の申出を受けた相手には、その後の広告宣伝メールを送りません。停止の記録は、停止を守るためにだけ保持します。",
        ],
      },
      {
        heading: "同意",
        paragraphs: ["[EDIT_REQUIRED: 事前の同意がある場合にだけ広告メールを送る旨と、同意の取得方法]"],
      },
    ],
  },
};

export const legalCopy: Record<AppLocale, LegalCopy> = {
  en: documentsEn,
  ja: documentsJa,
};
