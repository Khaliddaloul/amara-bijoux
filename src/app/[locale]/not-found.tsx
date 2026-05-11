import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export default async function LocaleNotFound() {
  const t = await getTranslations("errors");
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold text-black">{t("404Title")}</h1>
      <p className="max-w-md text-sm text-[#696969]">{t("404Message")}</p>
      <Button asChild className="bg-black text-white hover:bg-[#343434]">
        <Link href="/">{t("backHome")}</Link>
      </Button>
    </div>
  );
}
