import { getTranslations } from "next-intl/server";

export async function AnnouncementBar() {
  const t = await getTranslations("announcement");
  return (
    <div className="notice-bar bg-black py-2.5 text-center text-xs text-white md:text-sm">
      <p>
        <strong className="font-semibold">{t("titleStrong")}</strong>
        <span className="mx-1">—</span>
        <span>{t("titleRest")}</span>
      </p>
    </div>
  );
}
