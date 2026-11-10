# 追加要件定義書：共通LPプリセットおよび共通フッター基盤（requirementsadd2.md）

## 1. 概要・目的

本機能は、「my-saas-suite」のHub（親）および今後追加される全プロダクト（配下アプリ）において、一貫したブランド体験、高い成約率、および共通規約遵守を担保するための**共通LP（ランディングページ）プリセット**および**共通フッター**を整備することを目的とする。

開発者がCursor等のAIアシスタントを用いて開発する前提に立ち、**「あらかじめ用意されたダミー設定ファイル（または多言語辞書）のテキストを差し替えるだけで、洗練されたLPが即座に完成する」** ゼロコンフィグ運用を実現する。

---

## 2. LP全体セクション構成

`DESIGN.md` の原則（ドロップシャドウの完全排除、1px低コントラストボーダー、In-Placeインタラクション、セマンティックトークン）に完全準拠した全8セクション構成とする。

```
┌────────────────────────────────────────────────────────┐
│ [共通ヘッダー] ロゴ · ナビゲーション · ログイン/開く   │
├────────────────────────────────────────────────────────┤
│ ① ヒーロー (Hero Section)                             │
│    - 大見出し + サブコピー + メインCTA (Hub送客)       │
│    - プロダクトUIプレビュー（フラット枠）              │
├────────────────────────────────────────────────────────┤
│ ② 実績・ハイライト (Key Metrics / Social Proof)        │
│    - 3〜4個の主要数値（導入実績、工数削減率等）        │
├────────────────────────────────────────────────────────┤
│ ③ 機能紹介グリッド (Feature Grid)                      │
│    - 3列フラットカード（アイコン + 見出し + 説明）     │
├────────────────────────────────────────────────────────┤
│ ④ 導入ステップ (How It Works)                          │
│    - 3ステップの利用フロー（01, 02, 03）               │
├────────────────────────────────────────────────────────┤
│ ⑤ 導入事例 (Case Studies) ★新規追加                   │
│    - 事例カード一覧（ロゴ、企業名、成果サマリー）      │
│    - カードクリックで詳細モーダルが開く（In-Place）    │
├────────────────────────────────────────────────────────┤
│ ⑥ 料金・Suiteバンドル案内 (Pricing & Bundle CTA)       │
│    - 単体プラン vs Suiteバンドル案内のサマリー         │
├────────────────────────────────────────────────────────┤
│ ⑦ よくある質問 (FAQ) ★新規追加                         │
│    - アコーディオン開閉によるIn-Place展開              │
├────────────────────────────────────────────────────────┤
│ ⑧ クロージングCTA (Final CTA Banner)                   │
│    - 最終登録誘導バナー                                │
├────────────────────────────────────────────────────────┤
│ [共通フッター] 規約リンク · コピーライト · 言語切替    │
└────────────────────────────────────────────────────────┘

```

---

## 3. 新規追加・主要セクションの詳細仕様

### 3.1 導入事例セクション（Case Studies with Modal）

* **一覧カードレイアウト**:
* 3カラム（モバイル1カラム）のフラットカード形式。


* `border border-border/40 bg-card/50 rounded-lg p-6 hover:bg-muted/30 transition-colors cursor-pointer`。


* 企業名/ロゴ、業種バッジ、導入後の主な成果（例:「月間作業時間を40時間削減」）。


* **詳細モーダル仕様（DESIGN.md準拠）**:
* カードをクリックすると、ページ遷移を行わず同一画面上でモーダルが開く。


* **デザイン**: 全面暗転のオーバーレイ、モーダル本体は `border border-border/40 bg-background rounded-xl p-6`（ドロップシャドウなし）。


* **内容**:
* 課題（Before） ➔ 導入効果（After）
* 担当者コメント/インタビュー全文


* **最小化機能（Gmail-style）対応**:
* 必要に応じて右下にドック最小化できる枠組みを維持。




* **モバイル対応**: 768px未満では画面下部からせり上がるボトムシート（Bottom Sheet）または全画面モーダルとして描画。





### 3.2 FAQセクション（Accordion）

* **レイアウト**: 1カラムの中央揃えリスト（最大幅: `max-w-3xl`）。
* **アコーディオン仕様（DESIGN.md準拠）**:
* クリックにより同一ビュー内で質問に対する回答がスムーズに縦展開（In-Place）。


* アニメーション速度は 200ms〜250ms の `ease-out`（過度な装飾アニメーションは排除）。


* 区切り線は 1px のヘアライン境界線（`divide-y divide-border/30 border-y border-border/40`）。





### 3.3 共通フッター（SuiteFooter）

* **レイアウト**:
* 最上部に 1px の低コントラスト境界線（`border-t border-border/40`）。


* コピーライト: `© 2026 [Suite Name]. All rights reserved.`
* 法的リンク（Hub側の一元管理ページへ送客）:


* 利用規約（`{HUB_URL}/terms`）


* 特定商取引法に基づく表記（`{HUB_URL}/legal/merchant`）


* プライバシーポリシー（`{HUB_URL}/privacy`）




* 多言語切り替え（`JA | EN`）を右端に配置。





---

## 4. Cursor運用を前提としたデータ管理設計（ダミー差し替え方式）

配下アプリ（例: `products/app2`）を立ち上げる際、ページコンポーネント（TypeScript）にロジックを直書きさせず、**「1つの設定ファイル（または多言語辞書JSON）のダミー値をCursorで上書きするだけ」** で全セクションが完成するアーキテクチャを採用する。

### 4.1 ディレクトリ構成

```text
products/[app-name]/
├── config/
│   └── lp-content.ts          # LPの全コンテンツ（または messages/[locale].json 内の "LP" キー）
└── app/[locale]/
    └── page.tsx               # 共通LPテンプレート <SuiteLandingPage content={lpContent} /> を呼ぶだけ

```

### 4.2 コンテンツ定義構造（`config/lp-content.ts` ダミー雛形）

Cursorに「このアプリの概要に合わせて `lp-content.ts` の文言を書き換えて」と指示するだけで済むよう、型安全なダミーデータを用意する。型定義の正本は `packages/ui/src/landing/types.ts`（`@my-saas-suite/ui/landing` から import）で、以下はその要約である。

```typescript
export interface LPContent {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    primaryCta: { label: string; href?: string };
    secondaryCta: { label: string; href?: string };
  };
  metrics: Array<{ value: string; label: string }>;
  features: Array<{ title: string; description: string; iconName: string }>;
  steps: Array<{ stepNumber: string; title: string; description: string }>;
  caseStudies: Array<{
    id: string;
    company: string;
    industry: string;
    metric: string;
    challenge: string;
    solution: string;
    quote: string;
    author: string;
  }>;
  pricing: {
    singlePlan: LPPricingPlan;
    bundlePlan: LPPricingPlan;
  };
  faqs: Array<{ question: string; answer: string }>;
  closingCta: {
    title: string;
    subtitle: string;
    buttonLabel: string;
    buttonHref?: string;
  };
}

export interface LPPricingPlan {
  name: string;
  price: string; // 表示用に整形済みの価格（例: "¥4,980" / "$39"）
  period?: string; // 課金周期の接尾辞（例: "/ 月" / "/ month"）
  features: string[];
  ctaLabel?: string;
  ctaHref?: string;
}

```

---

## 5. 受け入れ基準（Acceptance Criteria）

1. **デザイン規約の完全遵守**:
* ドロップシャドウが一切使われておらず、境界線（`border-border/40`）とセマンティックトークン（`bg-background`, `text-foreground` 等）で整っていること。


* ライト/ダークモード両方でコントラストが崩れないこと。




2. **In-Place インタラクション**:
* FAQをクリックした際、ページリロードなしでアコーディオンが開閉すること。


* 導入事例カードをクリックした際、URL遷移なしで事例詳細モーダルが中央に表示され、閉じる/背景クリックでスムーズに復帰すること。




3. **Cursorでの差し替え容易性**:
* `lp-content.ts`（または該当JSON）のダミー文言を差し替えるだけで、画面側のコードを一切触らずにLP全体の文言・構成が更新されること。


4. **共通フッター**:
* 全画面の最下部に規約リンク、コピーライト、言語切り替えが正常に描画され、親Hubの規約URLへ正しくリンクしていること。