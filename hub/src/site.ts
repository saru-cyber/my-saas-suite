export interface SuiteSite {
  suiteName: string;
  companyName: string;
  representative: string;
  address: string;
  contactEmail: string;
  phone: string;
}

export const LEGAL_DISCLAIMER =
  "⚠️ 本ドキュメントはプロトタイプ用の参考資料であり、本番運用時は弁護士等の専門家によるリーガルチェックが必要です。";

export const suiteSite: SuiteSite = {
  suiteName: "Suite",
  companyName: "[要手動編集: 事業者名]",
  representative: "[要手動編集: 代表者名]",
  address: "[要手動編集: 所在地]",
  contactEmail: "[要手動編集: 連絡先メールアドレス]",
  phone: "[要手動編集: 電話番号]",
};
