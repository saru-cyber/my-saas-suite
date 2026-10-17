import { getLocale, getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { productSite, readHubUrl } from "../src/site";

export async function Footer() {
  const t = await getTranslations("footer");
  const locale = await getLocale();
  const year = new Date().getFullYear();
  const hubUrl = readHubUrl();

  return (
    <footer className="border-t border-gray-200 bg-white px-6 py-4 text-sm">
      <p>
        © {year} {productSite.companyName} ｜ <a href={`${hubUrl}/${locale}`}>{productSite.suiteName}</a> ｜{" "}
        <a href={`${hubUrl}/${locale}/terms`}>{t("terms")}</a>
      </p>
      <LocaleSwitcher />
    </footer>
  );
}
