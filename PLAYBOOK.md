# my-saas-suite 開発者向け運用手順書

この文書は、現在のリポジトリを環境構築から日常運用、新規プロダクト追加、決済と A/B テストの確認まで実行するための手順書です。画面の文言や保存先は実装と一致させています。英語の概要は [README.md](./README.md)、外部発注用の共通条項は [docs/PRODUCT_REQUIREMENTS_TEMPLATE.md](./docs/PRODUCT_REQUIREMENTS_TEMPLATE.md)、画面の見た目は [DESIGN.md](./DESIGN.md) を参照してください。

---

## 1. アーキテクチャと全体像

### 1.1 Hub-and-Spoke

Hub が認証、課金、利用規約、アカウント画面、管理者設定の正です。各プロダクトは Spoke で、独自のログイン画面を持ちません。

| 役割 | 場所 | 既定ポート | 持つもの |
| --- | --- | --- | --- |
| Hub | `hub/` | 3000 | 登録、`suite_session` の発行、Stripe、アカウント、管理者設定、利用規約 |
| Product App1 | `products/app1/` | 3001 | 公開ランディングと、契約者だけ入れる `/{locale}/dashboard` |
| CLI | `packages/cli/` | なし | `hub/.env.local` と `products/app1/.env.local` の生成 |

```
Hub :3000
  認証 · アカウント · 管理者設定 · Stripe · 利用規約
  Cookie: suite_session
        │  HS256 JWT
        ▼
products/app1 :3001
  ランディング（公開） · /{locale}/dashboard（契約者のみ）
```

本番では Hub とプロダクトをサブドメインに分け、`COOKIE_DOMAIN` を親ドメイン（例: `.your-suite.com`）にします。localhost では Cookie に `Domain` を付けないため、ポートが違っても同じホストの Cookie を共有します。

ロケールは `next-intl` の `/en` と `/ja` です。既定は `en` です。本書の日本語 URL は `/ja` を使います。`/en` に置き換えても同じ画面です。

### 1.2 共有セッション

Cookie 名は `suite_session` です。値は `HUB_JWT_SECRET` で署名した HS256 JWT です。発行は `signSession`、検証は Hub の `verifySession` と App1 の `verifySessionToken` です。

| クレーム | 型 | 意味 |
| --- | --- | --- |
| `userId` | string | ユーザー ID |
| `email` | string | メールアドレス |
| `activeProducts` | string[] | 契約中のプロダクト ID。バンドル購入時は含まれる ID がすべて入る |
| `plan` | string | `free` または購入後の `pro` |
| `role` | `"admin"` または `"member"` | 管理者設定の可否。プロダクトのゲートは使わない |

`role` が無い古いトークンは `roleFromClaims` により `member` になります。権限を変えたあとは、もう一度ログインしてください。

未ログインで `/ja/admin/settings` を開くと `/ja/login` へ送ります。ログイン済みの `member` は `/ja/dashboard` へ戻します。この判定は `hub/app/[locale]/admin/layout.tsx` にあります。

App1 の `middleware.ts` が守るのは `/{locale}/dashboard` だけです。ランディングは公開です。Cookie が無い、署名が合わない、期限切れ、または `activeProducts` にそのアプリの `PRODUCT_ID` が無い場合、`{NEXT_PUBLIC_HUB_URL}/{locale}/login` へ送ります。

価格の振り分けには、別 Cookie `suite_vid` を使います。ログイン中の判定は `userId` を優先します。未ログイン時だけ `suite_vid` を使います。この Cookie は `POST /api/v1/checkout` が無いときに発行します。`httpOnly`、有効期限は 1 年です。

### 1.3 データの保存とフォールバック

接続文字列は `DATABASE_URL` です。`pnpm cli` が書く初期値は次です。

```text
postgresql://postgres:postgres@localhost:5432/saas_hub?schema=public
```

Postgres に 1 秒以内でつながるとき、Hub は Drizzle で次のテーブルを `CREATE TABLE IF NOT EXISTS` します。つながらないときは、そのプロセスのメモリに保持し、以降のそのプロセスでは再接続しません。Postgres をあとから起動した場合は Hub を再起動してください。

| データ | テーブル | Postgres 接続時 | 未接続時 |
| --- | --- | --- | --- |
| 認証・Stripe キー・外観 | `system_settings` | 保存する | プロセスメモリ。無ければ環境変数 |
| 価格 | `pricing_configurations` | 保存する | プロセスメモリ |
| バンドル | `product_bundles` | 保存する | プロセスメモリ |
| A/B テスト | `ab_tests` | 保存する | プロセスメモリ |
| A/B イベント | `ab_test_events` | 保存する | プロセスメモリ |
| ユーザー、パスワード、`activeProducts` | `users` はスキーマのみ | 実行時は書き込まない | `hub/src/db/users.ts` のメモリ |

ユーザーは常にメモリです。Hub を再起動すると、デモユーザー以外の登録と、Postgres に書けなかった設定・購入状態は消えます。デモユーザーは起動のたびに同じ ID で再作成されます。

```text
00000000-0000-4000-8000-000000000001
```

Checkout がモックかどうかは、管理画面の保存値ではなく、プロセスの `STRIPE_SECRET_KEY` です。`isStripeMockMode()` は、この値が空、または `sk_test_YOUR_STRIPE_SECRET_KEY` のとき真です。

---

## 2. ローカル環境の初期セットアップ

### 2.1 前提

- Node.js 20.9 以上（このリポジトリは Next.js 16.4 を使います）
- pnpm 12.14.0（ルートの `packageManager` がこの版です。違う版で起動すると、指定の版を取りにいきます）
- Stripe、Postgres、GA4 のアカウントは、モックのまま動かす限り不要です

### 2.2 起動

リポジトリのルートで実行します。

```bash
pnpm install
pnpm cli
pnpm dev
```

1. `pnpm install` はワークスペース（`hub`、`products/*`、`packages/*`）の依存を入れます。
2. `pnpm cli` は `crypto.randomBytes(32)` で `HUB_JWT_SECRET` と App1 向けの内部 API キーを作り、`hub/.env.local` と `products/app1/.env.local` を上書きします。Stripe キーはダミーのままです。このコマンドは追加プロダクトの env ファイルを作りません。再実行すると Hub と App1 の秘密が変わり、既存の `suite_session` は無効になります。必要なときだけ再実行してください。
3. `pnpm dev` は Turborepo 経由で、`dev` スクリプトを持つ各パッケージを起動します。Hub は 3000、App1 は 3001 です。

### 2.3 URL

| 画面 | URL |
| --- | --- |
| Hub ランディング（公開） | http://localhost:3000/ja |
| Hub ログイン（登録・ログイン・App1 のモック購入） | http://localhost:3000/ja/login |
| アカウント（マイページ） | http://localhost:3000/ja/dashboard |
| 管理者設定 | http://localhost:3000/ja/admin/settings |
| App1 ランディング | http://localhost:3001/ja |
| App1 ダッシュボード | http://localhost:3001/ja/dashboard |

英語はパスの `ja` を `en` にします。

3000 番が別アプリで埋まっているときは、Hub だけ別ポートで起動できます。

```bash
pnpm --filter hub exec next dev --port 3010
```

継続してそのポートを使うなら、`hub/package.json` の `dev` と `start` を `--port 3010` に変え、`hub/.env.local` と `products/app1/.env.local` の `NEXT_PUBLIC_HUB_URL` を `http://localhost:3010` に合わせます。App1 の起動は止めずに、別ターミナルで `pnpm --filter app1 dev` を使えます。占有中のプロセスは停止しないでください。

### 2.4 デモアカウント

| 種別 | メール | パスワード | 権限 |
| --- | --- | --- | --- |
| デモ管理者 | `demo@example.com` | `password` | `role: admin`。アカウントと管理者設定の両方を開ける |
| 画面から新規登録したユーザー | 登録したアドレス | 登録したパスワード | `role: member`。アカウントは開ける。管理者設定へ進むとアカウントへ戻る |

デモユーザーの初期プランは `free`、`activeProducts` は空です。日本語の Hub ログイン画面（`/ja/login`）でログインすると出る **App1 (Proプラン) を購入する (Mock)**（英語 UI では **Buy App1 (Pro) (Mock)**）は `POST /api/stripe/checkout` を呼び、モック中は `app1` を付与して `http://localhost:3001/dashboard?mock_success=true` を返します。このパスにロケールは付いていません。App1 の `next-intl` が既定ロケールのダッシュボードへ送り、そこで契約を確認します。

新規登録のパスワードは 8 文字以上 72 文字以内です。登録したユーザーの `role` は `member` です。

登録ユーザーは Hub プロセスのメモリにだけいます。再起動後に同じ人として扱うには、もう一度登録してください。デモユーザーの ID は再起動後も同じです。

---

## 3. 管理者設定コンソール

URL は http://localhost:3000/ja/admin/settings です。デモ管理者で http://localhost:3000/ja/login からログインし、ログイン画面またはアカウントの「管理設定」から開きます。

タブは認証、決済、価格、バンドル、A/Bテスト、外観です。切り替えは同じ URL のままです。保存も遷移せず、画面下のトーストで結果を出します。成功時の文言は「設定を保存しました」です。秘密の入力を空のまま保存すると、既存の秘密を残します。

### 3.1 認証

保存先は `system_settings` の `auth`、実装は `saveAuthSettings` です。

- Google クライアント ID とクライアントシークレットを保存します。シークレットは末尾だけをマスクして再表示します。
- コールバック URL は `{現在のオリジン}/api/auth/google/callback` です。コピーして Google Cloud に登録するための表示です。このパスの OAuth ルートはまだありません。
- セッション有効期限は 1 から 720 の整数時間です。初期値は 168 時間です。次のログイン、およびモック購入で Cookie を再発行するときから適用されます。

### 3.2 決済

保存先は `system_settings` の `billing`、実装は `saveBillingSettings` です。

- 公開可能キー、シークレットキー、Webhook シークレットを保存します。秘密はマスク表示です。
- モードはモック、テスト、ライブです。
- 月額 Price ID、年額 Price ID、Pricing Table ID を保存します。月額 Price ID は、App1 に有効な `pricing_configurations` が無いときの `resolvePricingVariant` の予備値です。環境変数 `STRIPE_PRICE_APP1` がそれより優先されます。

ここでのモードとキーは記録です。実行中の Checkout と Webhook は `hub/.env.local` の `STRIPE_SECRET_KEY` と `STRIPE_WEBHOOK_SECRET` を見ます。保存した秘密と環境変数の秘密がどちらもダミーのまま、モック以外のモードを選ぶと、画面は「ダミーキーの間は、別のモードを選んでもチェックアウトはモックのままです。」と知らせます。本番または Stripe テストへ切り替える手順は [5.2](#52-stripe-のテストキーまたは本番キーへ移す) です。

### 3.3 外観

保存先は `system_settings` の `appearance`、実装は `saveAppearanceSettings` です。

- ブランドカラーは `#RRGGBB` です。保存すると Hub の `--primary`、`--ring`、コントラスト用の `--primary-foreground` がその場で変わります。空にするとプリセットへ戻します。
- ロゴ URL は空、または `http` / `https` です。空にすると Hub ヘッダーのロゴを出しません。
- 既定テーマは System、Light、Dark です。Hub の `html` クラスに反映されます。

この設定は Hub の画面に効きます。App1 は `system_settings` を読まないため、プロダクト側の色は自動では変わりません。プロダクトは `bg-primary` などのセマンティックトークンで組んでおきます。

### 3.4 価格

実装は `saveProductPricing` と `savePricingConfiguration` です。対象は `hub/src/products/catalog.ts` の `suiteProducts` に入っているプロダクトです。現在は `app1` だけです。

各プロダクトに対して次を保存します。

| 項目 | 値 |
| --- | --- |
| プロダクト ID | 表示のみ。例: `app1` |
| 決済パターン | `p05_flat_sub`（定額サブスク）、`p06_trial_sub`（無料トライアル付き）、`p01_digital_download`（買い切り） |
| Stripe Price ID | Stripe の Price ID。モックでも空にはできません |
| トライアル日数 | `p06_trial_sub` のときだけ表示。0 から 730 の整数。それ以外のパターンは 0 として保存 |
| 通貨 | 3 文字。初期値 `jpy` |
| 有効 | `isActive`。同じ対象で有効にした行が複数にならないよう、保存時に他の有効行を無効にします |

`POST /api/v1/checkout` は、実施中の A/B テストが無いとき、この有効行を価格に使います。

### 3.5 バンドル

実装は `saveBundlePackage` です。内部で `saveProductBundle` と、そのバンドル ID を `targetId` にした `savePricingConfiguration` を続けて呼びます。

- バンドル名。例: `Suite All-Access Pack`
- スラッグ。英小文字、数字、ハイフン。例: `all-access`。大文字は小文字にして検証します
- 含むプロダクト。`suiteProducts` のチェックボックス。現在は `app1` のみ。1 つ以上必須です
- 決済パターン、Stripe Price ID、通貨、トライアル日数、有効フラグ。価格タブと同じ規則です
- 説明文。空でも保存できます

作成に成功すると、同じ画面の一覧に名前とスラッグが出て、ボタンが「バンドルを更新」になります。一覧の項目を押すと、その内容がフォームに戻ります。Checkout に渡す `targetId` はスラッグではなく、保存されたバンドルの `id` です。

App2 をチェックボックスに出すには、先に [4.4](#44-ポート環境変数カタログ) のカタログ登録が必要です。

### 3.6 A/B テスト

実装は `saveExperiment`（内部で `saveAbTest`）と、集計の `summarizeVariant` です。

フォームの項目は次のとおりです。

- テスト名
- 対象の種類。プロダクト、または作成済みバンドル
- 対象 ID。プロダクトなら `app1`。バンドルなら名前とスラッグを表示し、値はバンドル `id`
- Variant A の配分。0 から 100 の整数。初期値 50。残りが Variant B です
- Variant A / B の決済パターンと Stripe Price ID
- ステータス。`draft`（下書き）、`running`（実施中）、`paused`（一時停止）、`finished`（終了）

同じ対象に `running` が複数あるとき、`getRunningAbTest` は ID の若いテストを採用します。判定は `resolvePricingVariant` です。ログイン中は `user:{userId}`、未ログイン時は `visitor:{suite_vid}` を SHA-256 し、0 から 99 の値にします。その値が配分未満なら A、そうでなければ B です。同じユーザーは再読み込みしても同じバリアントになります。

成果レポートはテストごとに A と B の行を出します。「レポートを更新」は `loadExperimentReport` を呼び、ページ遷移はありません。

| 列 | 集計 |
| --- | --- |
| Impression | `impression` イベントの、ユーザーまたは訪問者ごとのユニーク数 |
| Checkout 到達 | `checkout_start` の件数 |
| Checkout 到達率 | 到達件数 / Impression。Impression が 0 のときは「—」 |
| 成約数 | `conversion` の件数 |
| 成約率 | 成約件数 / Impression。Impression が 0 のときは「—」 |
| 累計売上 | `conversion` の `amountCents` 合計。`jpy` はそのまま円として表示 |

画面を開いただけでは Impression は増えません。`recordAbTestEvent` を呼んだときだけ増えます。購入 API が書くのは到達と成約で、手順は [5.1](#51-モックモード) です。

---

## 4. 新規プロダクトの追加

App1 をコピーする前に、そのアプリ単体で画面と動作を済ませます。サインアップとログインは作らず、`next-intl` で `/en` と `/ja` を用意します。

### 4.1 単体で開発する

通常の Next.js アプリとして、Suite の外で実装とテストを終えます。Hub の Cookie がまだ無い状態でも、公開ページが表示できることを確認します。

### 4.2 `products/` へ置く

ディレクトリを `products/<app-name>` へコピーします。その `package.json` の `name` はワークスペース内で一意にします。`pnpm-workspace.yaml` は `products/*` をすでに含むため、書き換えません。ルートの `pnpm dev` は、そこにある `dev` スクリプトも起動します。

### 4.3 セッションガードを入れる

次のファイルを `products/app1` から、新しいアプリにまだ無ければコピーします。

- `middleware.ts`
- `src/auth/session.ts`
- `src/auth/claims.ts`
- `i18n/routing.ts`

`src/auth/session.ts` の `PRODUCT_ID` を新しい ID にします。例: `app2`。この文字列が、Hub の `activeProducts` と一致している必要があります。

ガードの動作は App1 と同じです。`/{locale}/dashboard` だけを検査し、未ログインまたは未契約なら `{NEXT_PUBLIC_HUB_URL}/{locale}/login` へ送ります。

### 4.4 ポート、環境変数、カタログ

`products/<app-name>/package.json` で、空いているポートを指定します。

```json
"dev": "next dev --port 3002",
"start": "next start --port 3002"
```

`pnpm cli` は Hub と App1 の env だけを上書きします。追加アプリには、自分で `products/<app-name>/.env.local` を作り、Hub と同じ `HUB_JWT_SECRET` を置きます。

```text
PRODUCT_ID="app2"
NEXT_PUBLIC_HUB_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3002"
COOKIE_DOMAIN="localhost"
HUB_JWT_SECRET="hub/.env.local と同じ値"
```

Hub 側では次の 2 か所に ID を足します。

1. `hub/src/products/catalog.ts` の `suiteProducts` と `suiteProductLaunchUrl`。アカウントのプロダクト一覧と、価格タブ、バンドルのチェックボックスがこの一覧を使います。起動 URL は `http://localhost:3002/{locale}/dashboard` の形にします。
2. `hub/src/billing/stripe.ts` の `PRODUCT_IDS`。Hub ログイン画面の既存購入 API `POST /api/stripe/checkout` が受け付ける `targetProduct` は、この配列だけです。

`activeProducts` に `app2` が入るまで、App2 のダッシュボードは Hub のログイン画面へ戻ります。モックで付与する手順は [5.1](#51-モックモード) です。

### 4.5 共通ランディングページ、ヘッダー、フッター

公開ランディング、ヘッダー、フッターは `packages/ui`（`@my-saas-suite/ui`）の共通部品を使います。仕様は [requirementsadd2.md](./requirementsadd2.md) です。App1 と同じ構成にするには、次を App1 からまねます。

1. `package.json` の `dependencies` に `"@my-saas-suite/ui": "workspace:*"` を足し、`pnpm install` を実行します。
2. `next.config.ts` に `transpilePackages: ["@my-saas-suite/ui"]` を足します。`packages/ui` はビルドせず TypeScript のまま読み込むためです。
3. `app/globals.css` を App1 からコピーします。セマンティックカラー（`--background` など）と `@source "../../../packages/ui/src";` が入っています。`@source` が無いと、共通部品のクラスが生成されず、スタイルの無い表示になります。
4. `app/[locale]/layout.tsx` で `SuiteHeader`（`@my-saas-suite/ui/header`）と `SuiteFooter`（`@my-saas-suite/ui/footer`）を描画します。ヘッダーの「ログイン」と「無料で始める」は Hub の `/{locale}/login` へ、フッターの規約リンクは Hub の利用規約、特定商取引法に基づく表記、プライバシーポリシーへ送ります。
5. `config/lp-content.ts` に LP の文言を置き、`app/[locale]/page.tsx` は `<SuiteLandingPage content={...} locale={locale} showFooter={false} />` を返すだけにします。レイアウトがフッターを出すため `showFooter={false}` です。

文言の変更は `config/lp-content.ts` だけで済み、画面のコードは触りません。型は `LPContent`（`@my-saas-suite/ui/landing`）です。ダミー文言の雛形は `getDefaultLpContent(locale)` で、App1 はこれを土台に必要な項目だけを上書きしています。機能アイコンの `iconName` は lucide-react のアイコン名（PascalCase、例: `Workflow`）です。存在しない名前は既定のアイコンになります。

外部チームへ実装を渡すときは、[docs/PRODUCT_REQUIREMENTS_TEMPLATE.md](./docs/PRODUCT_REQUIREMENTS_TEMPLATE.md) の条項を要件定義へ貼ります。

---

## 5. 決済と A/B テストの確認

購入 API は 2 つあります。

| API | 用途 | モック時の付与 |
| --- | --- | --- |
| `POST /api/stripe/checkout` | Hub ログイン画面の App1 購入ボタン。`targetProduct` は `app1` のみ | `app1` を付与し、Cookie を再発行。成功 URL は `http://localhost:3001/dashboard?mock_success=true` |
| `POST /api/v1/checkout` | 価格タブ、バンドル、A/B テストを使う購入。ログイン必須 | `fulfillPurchase` で単体またはバンドルを付与し、Cookie を再発行。成功 URL は Hub の `/{locale}/dashboard?mock_success=true` |

どちらも、リクエストの `userId` はログイン中の `suite_session` と一致している必要があります。

### 5.1 モックモード

`hub/.env.local` の `STRIPE_SECRET_KEY` が `sk_test_YOUR_STRIPE_SECRET_KEY` のままならモックです。Stripe へは接続しません。Webhook は `{ "ok": true, "skipped": true }` を返して終了します。

**App1 だけを試す**

1. `demo@example.com` / `password` で http://localhost:3000/ja/login からログインします。
2. ログイン画面に出る購入ボタンを押します。
3. アカウントを開き、プロダクトに App1 が出ること、App1 の http://localhost:3001/ja/dashboard が開けることを確認します。

**バンドルを試す**

1. 管理者設定のバンドルタブで、`app1` を含むバンドルと Price ID を保存します。
2. ブラウザの開発者ツールで `suite_session` を確認するか、次のコマンドで Cookie を保存します。デモユーザーの `userId` は上に書いた固定 UUID です。ログイン応答の `user.userId` を使っても同じです。

```bash
curl -c cookies.txt -H "Content-Type: application/json" \
  -d "{\"email\":\"demo@example.com\",\"password\":\"password\"}" \
  http://localhost:3000/api/auth/login

curl -b cookies.txt -c cookies.txt -H "Content-Type: application/json" \
  -d "{\"userId\":\"00000000-0000-4000-8000-000000000001\",\"targetId\":\"バンドルの id\",\"locale\":\"ja\"}" \
  http://localhost:3000/api/v1/checkout
```

3. 応答の `entityType` が `bundle`、`mock` が `true` であることを確認します。
4. アカウントを再読み込みし、`includedProductIds` のプロダクトが使えることを確認します。プランは `pro` になります。同じプロダクト ID は重複しません。

`targetId` にスラッグを渡してもバンドルとしては見つかりません。保存後の一覧ではなく、API 応答かデータ上の `id` を使います。

**A/B テストの成約を試す**

1. 価格タブで対象の Price ID を保存するか、テストの Variant に Price ID を入れます。
2. A/B テストの対象をそのプロダクトまたはバンドルにし、ステータスを実施中にして保存します。
3. 同じユーザーで `POST /api/v1/checkout` を 1 回呼びます。`targetId` はテストの対象と一致させます。
4. 管理者設定の A/B テストタブで「レポートを更新」を押します。

モックの 1 回目は、そのユーザー、テスト、対象の組み合わせで `checkout_start` と `conversion` を 1 件ずつ記録します。2 回目以降の同じ組み合わせは、権限付与は繰り返しますが、イベントは増やしません。モックの成約には金額を入れないため、成約数は増えても累計売上は ￥0 のままです。Impression は購入 API では増えません。

到達率と成約率は Impression が 0 のあいだ「—」です。これは不具合ではなく、`summarizeVariant` の定義です。

### 5.2 Stripe のテストキーまたは本番キーへ移す

管理画面へキーを入力しただけでは、実行中の Checkout はモックのままです。次の順で環境変数を変えます。

1. `hub/.env.local` の `STRIPE_SECRET_KEY` を、Stripe のテスト秘密鍵または本番秘密鍵に置き換えます。ダミー値 `sk_test_YOUR_STRIPE_SECRET_KEY` を残すとモックのままです。
2. 価格タブ、バンドル、A/B テストに、その Stripe アカウントの本物の Price ID を保存します。`p06_trial_sub` の日数は Checkout の `subscription_data.trial_period_days` になります。Checkout のモードは `subscription` です。
3. Webhook の受信先を `http://localhost:3000/api/stripe/webhook` にします。Stripe CLI を使う例です。

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. CLI が表示した `whsec_...` を `hub/.env.local` の `STRIPE_WEBHOOK_SECRET` に書きます。ダミー値 `whsec_YOUR_WEBHOOK_SECRET` のままだと、署名確認で拒否します。
5. Hub を再起動し、環境変数を読み直します。
6. `POST /api/v1/checkout` の応答 `url` をブラウザで開きます。支払い完了後、Stripe は `checkout.session.completed` を送ります。
7. Webhook は `readPurchaseIntent` で metadata の `entity_type`、`target_id`、`ab_test_id`、`ab_variant`、`user_id` を読みます。単体ならその ID、バンドルなら `includedProductIds` を `activeProducts` へ入れます。A/B テスト経由の初回だけ `conversion` を記録し、`amountCents` には Stripe の `amount_total`（その通貨の最小単位。円なら円）を入れます。同じ Checkout Session の再送では成約を二重に数えません。

Hub ログイン画面からの既存の購入は、引き続き `POST /api/stripe/checkout` です。ライブ時は管理画面の Price ID ではなく、コード内の都度価格で Checkout を作ります。Price ID と A/B テストを通す購入は `POST /api/v1/checkout` を使います。

ライブ購入のあと、開いているブラウザの JWT は古いままです。アカウントの表示を新しい `activeProducts` に合わせるには、もう一度ログインするか、モック時のように Cookie を再発行する操作が必要です。Webhook はメモリ上のユーザーは更新しますが、すでに発行済みの Cookie は書き換えません。

---

## 6. トラブルシューティング

### 6.1 セッションが共有されない、または Hub とプロダクトを往復する

確認する順は次のとおりです。

1. Hub とプロダクトの `HUB_JWT_SECRET` が同じ文字列であること。`pnpm cli` を再実行したあとは、追加プロダクトの env へ秘密をコピーし直します。
2. プロダクトの `NEXT_PUBLIC_HUB_URL` が、実際に開いている Hub のオリジンと一致すること。ポートを 3010 にしたのに 3000 のままだと、戻る先が違います。
3. localhost では `COOKIE_DOMAIN` を `localhost` のままにすること。この値のときは Cookie に `Domain` 属性を付けません。`Domain=localhost` を付けると、ブラウザが Cookie を捨てることがあります。
4. Hub とプロダクトが別ホスト（例: `127.0.0.1` と `localhost`）になっていないこと。Cookie はホスト単位です。
5. プロダクトの `PRODUCT_ID` が、ユーザーの `activeProducts` に入っていること。未契約の往復は、秘密の不一致ではなくゲートの正常動作です。
6. 管理者設定へ入れないときは、一度ログアウトして `demo@example.com` でログインし直すこと。`role` の無いトークンは `member` です。

### 6.2 ポートが埋まっている

`EADDRINUSE` が出たら、そのポートのプロセスは停止せず、空いているポートへ Hub またはプロダクトの `dev` / `start` を変更します。[2.3](#23-url) の 3010 の例と同じです。`NEXT_PUBLIC_HUB_URL` と、カタログの起動 URL も新しいオリジンに合わせます。

### 6.3 再起動で設定やユーザーが消える

ユーザー、および Postgres へ書けなかった設定、価格、バンドル、A/B テスト、イベントはプロセスメモリです。残したいものは Postgres を起動し、データベース `saas_hub` を作り、`DATABASE_URL` がそこを指している状態で Hub を再起動します。

初回リクエストは、接続できないと約 1 秒待ってからメモリへ落ちます。一度落ちたプロセスは、Postgres が後から起動しても自動では戻りません。Hub を再起動してください。

ユーザーと `activeProducts` は、Postgres が生きていてもメモリのままです。購入状態を再起動後も保持する処理は、現在の `hub/src/db/users.ts` にはありません。デモユーザーだけが毎回同じ ID で戻ります。

### 6.4 管理画面でキーを保存したのにモックのまま

`isStripeMockMode()` は環境変数だけを見ます。管理画面の決済タブは値を保存しますが、実行中の秘密鍵は変えません。[5.2](#52-stripe-のテストキーまたは本番キーへ移す) の手順で `hub/.env.local` を変え、Hub を再起動してください。

### 6.5 A/B の売上が 0 のまま

モック購入の成約は件数だけを記録し、金額は入れません。売上の数値は、ライブの `checkout.session.completed` が `amount_total` を `amountCents` に入れたあとに増えます。Impression が 0 のとき、到達率と成約率は「—」です。
