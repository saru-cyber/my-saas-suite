# Suite 共通要件（要件定義書へ転記する条項）

この文書は、my-saas-suite 配下のプロダクトを別チームまたは外部パートナーへ発注するとき、要件定義書の「共通要件」章としてそのまま貼り付けるためのテンプレートです。`[角括弧]` の項目を案件の値に置き換えてください。認証、課金、利用規約、アカウント画面、管理者設定は Hub が所有します。受託範囲はプロダクトアプリ本体です。

| 項目 | 値 |
| --- | --- |
| プロダクト名 | `[PRODUCT_NAME]` |
| プロダクト ID | `[PRODUCT_ID]`（例: `app2`。JWT の `activeProducts` と一致させる） |
| ローカルポート | `[PORT]`（Hub は `3000`、既存の App1 は `3001`。重複しないこと） |
| ローカル URL | `http://localhost:[PORT]/en` |
| 保護するパス | `/[locale]/dashboard` |
| 対応ロケール | `en`（既定）、`ja` |

Suite 側（発注元）が行う作業は、ディレクトリの受け入れ、`HUB_JWT_SECRET` の共有、Hub のプロダクト一覧と Checkout 対象への ID 登録です。受託側は独自の会員登録、ログイン、Stripe 決済を実装しません。

---

## 1. 認証・セッション

1. サインアップ画面、ログイン画面、パスワード再設定、および独自のセッション Cookie を実装しない。
2. 認可に使う資格情報は、Hub が発行する Cookie `suite_session` だけとする。値は HS256 で署名された JWT であり、検証鍵は Hub と同一の `HUB_JWT_SECRET` とする。
3. 認可判定に使うクレームは次のとおりとする。

   | クレーム | 型 | 用途 |
   | --- | --- | --- |
   | `userId` | string | ユーザー識別子 |
   | `email` | string | 表示および監査 |
   | `activeProducts` | string[] | 契約中プロダクト ID の一覧 |
   | `plan` | string | Suite プラン名（例: `free`, `pro`） |

   `role` など上記以外のクレームが付いていても、プロダクトの認可では使わない。検証は、未知のクレームがあっても `userId`, `email`, `activeProducts`, `plan` が上記の型であれば成功すること。
4. 次のいずれかに該当するリクエストは、プロダクトの保護パスを表示せず、Hub の同じロケールへリダイレクトする。
   - Cookie が無い、署名が不正、または有効期限切れ。
   - `activeProducts` に `[PRODUCT_ID]` が含まれない。
5. リダイレクト先は `{NEXT_PUBLIC_HUB_URL}/[locale]` とする。この URL は Hub ホームであり、サインインと当該プロダクトの購入導線を持つ。プロダクト側で別のログイン URL や課金 URL を組み立てない。
6. 基準実装は `products/app1/middleware.ts` とする。保護対象は `/en/dashboard` と `/ja/dashboard` であり、公開ランディングはゲートしない。保護範囲を広げる場合は、このリダイレクト規則を同じロケールのまま適用する。
7. Cookie は localhost では host-only とし、ポートが違っても Hub とプロダクトで共有される。本番では親ドメイン（`COOKIE_DOMAIN`）で共有する。プロダクトが Cookie を再発行したり、ドメイン属性を変えたりしない。
8. セッションの有効期限は Hub の管理者設定が決める。プロダクトは期限を独自に延長しない。

## 2. 多言語・ルーティング

1. `next-intl` を使い、画面パスを `/[locale]/...` とする。ロケールは `en` と `ja`、既定は `en` とする。
2. 文言は `messages/en.json` と `messages/ja.json` に置き、画面へ直書きしない。
3. フッターなどから、同じページの EN と JA を行き来できること。
4. Hub へ戻すリンクと、未認可時のリダイレクトは、閲覧中のロケールを維持する。`/ja/dashboard` から戻す先は `{NEXT_PUBLIC_HUB_URL}/ja` とする。

## 3. UI/UX・デザイン原則

プロダクト画面はリポジトリの `DESIGN.md` に従う。

1. ドロップシャドウ（`shadow-*`）を使わない。区切りは余白、背景のわずかな差、および 1px の低コントラスト線（`border-border/40` または `divide-border/30`）に限る。
2. 色はセマンティックトークンだけを使う。`bg-background`, `bg-card`, `bg-primary`, `text-foreground`, `text-muted-foreground`, `text-primary`, `border-border` を用い、マークアップに `#fff`, `#000`, `bg-white`, `text-black` などの固定色を置かない。
3. ライトとダークの両方で、文字と境界のコントラストが読めること。アクセントは `bg-primary` / `text-primary` に追従させる。
4. タブ、フィルタ、保存などの状態変更は、同じビューの中で行う。詳細の開閉や設定の反映に、不要な `router.push` や全画面リロードを使わない。
5. 保存や非同期処理の完了は、画面遷移ではなく自動で消えるトーストで知らせる。
6. 狭い画面幅では、タブやフィルタの横並びを折り返さず `overflow-x-auto` で 1 行に収める。
7. ホバー（`hover:bg-muted/50`）とキーボードフォーカス（`focus-visible:ring-2`）を付ける。`prefers-reduced-motion: reduce` では位置や拡大のアニメーションを止める。

## 4. Hub との結合

### 4.1 マイページ

Hub のアカウント画面は `http://localhost:3000/en/dashboard`（日本語は `/ja/dashboard`）である。ここに並ぶプロダクトの起動先は、次の形に固定する。

```text
{NEXT_PUBLIC_APP_URL}/[locale]/dashboard
```

受託側は、このパスで認証済みかつ `[PRODUCT_ID]` を契約しているユーザーが製品本体を使えるようにする。一覧への掲載、購入ボタン、Customer Portal は Hub の責務であり、プロダクトアプリに重複して実装しない。

発注元は、受け入れ時に次を Hub へ登録する。

- `hub/src/products/catalog.ts` のプロダクト ID と起動 URL。
- `hub/src/billing/stripe.ts` の `PRODUCT_IDS`。購入完了後、Hub が `activeProducts` へこの ID を入れる。

### 4.2 管理者設定（外観・Stripe）

管理者設定は `http://localhost:3000/en/admin/settings` にあり、`role: admin` のセッションだけが開ける。プロダクトアプリに設定コンソールを作らない。

| Hub のタブ | プロダクト側の扱い |
| --- | --- |
| 認証 | Google OAuth のクライアント情報と SSO 有効期限は Hub が保持する。プロダクトは `suite_session` の検証だけを行う。 |
| Stripe | 公開可能キー、シークレット、Webhook、モード、月額・年額 Price ID、Pricing Table ID は Hub が保持する。プロダクトに Stripe シークレットや Checkout を埋め込まない。契約の有無は `activeProducts` で判断する。 |
| 外観 | ブランドカラー、ロゴ URL、既定テーマは Hub の画面へ適用される。プロダクトは同じセマンティックトークンで組み、独自のブランド色を固定しない。 |

Checkout と Customer Portal の実行時モードは、Hub 環境変数 `STRIPE_SECRET_KEY` に従う。値がダミー（`sk_test_YOUR_STRIPE_SECRET_KEY`）の間はモックであり、プロダクト側で Stripe を呼び出して補完しない。

### 4.3 環境変数

`products/[PRODUCT_ID]/.env.local` に、少なくとも次を置く。`HUB_JWT_SECRET` は `pnpm cli` が書いた `hub/.env.local` の値と一致させる。`pnpm cli` が自動で書くのは Hub と `products/app1` だけで、追加プロダクトのファイルは発注元が用意する。

```text
PRODUCT_ID="[PRODUCT_ID]"
NEXT_PUBLIC_HUB_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:[PORT]"
COOKIE_DOMAIN="localhost"
HUB_JWT_SECRET="[HUB と同一の値]"
```

シークレット、JWT、Cookie の実値を要件定義書、Issue、ログへ記載しない。

## 5. 受け入れ条件

1. `products/[PRODUCT_ID]` を配置し、ポートとミドルウェアを設定した状態で、`pnpm dev` から起動できる。
2. 未ログインで `/en/dashboard` と `/ja/dashboard` を開くと、同じロケールの Hub ホームへ戻る。
3. ログイン済みでも `activeProducts` に `[PRODUCT_ID]` が無い場合は、同じ Hub ホームへ戻る。
4. `[PRODUCT_ID]` を契約したセッションでは、両方のロケールでダッシュボードが表示される。公開ランディングは未ログインでも表示される。
5. プロダクト内にサインアップ、ログイン、Stripe Checkout が無い。
6. 画面が `DESIGN.md` のフラットな境界線、セマンティックカラー、ライト/ダークに沿っている。
7. Hub のアカウント画面から `{NEXT_PUBLIC_APP_URL}/[locale]/dashboard` へ遷移できる（発注元のカタログ登録後）。
