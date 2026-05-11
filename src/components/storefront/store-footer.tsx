import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

export async function StoreFooter() {
  const t = await getTranslations("footer");
  return (
    <footer
      className="border-t border-[#f0f0f0] bg-[#fefefe] text-black"
      style={{ borderTopColor: "#f0f0f0", backgroundColor: "#fefefe", color: "#000000" }}
    >
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t("termsHeading")}</h3>
            <ul className="space-y-2 text-sm text-[#696969]">
              <li>
                <Link href="/pages/terms" className="hover:text-black hover:underline">
                  {t("termsLink")}
                </Link>
              </li>
              <li>
                <Link href="/pages/shipping-returns" className="hover:text-black hover:underline">
                  {t("returnPolicy")}
                </Link>
              </li>
              <li>
                <Link href="/pages/privacy" className="hover:text-black hover:underline">
                  {t("privacyPolicy")}
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t("contactHeading")}</h3>
            <ul className="space-y-2 text-sm text-[#696969]">
              <li>
                <Link href="/contact" className="hover:text-black hover:underline">
                  {t("contactLink")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-black hover:underline">
                  {t("faq")}
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t("aboutHeading")}</h3>
            <ul className="space-y-2 text-sm text-[#696969]">
              <li>
                <Link href="/about" className="hover:text-black hover:underline">
                  {t("aboutLink")}
                </Link>
              </li>
              <li>
                <Link href="/pages/terms" className="hover:text-black hover:underline">
                  {t("paymentMethods")}
                </Link>
              </li>
              <li>
                <Link href="/pages/shipping-returns" className="hover:text-black hover:underline">
                  {t("shippingDelivery")}
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="text-xs leading-relaxed text-[#747474]">{t("tagline")}</p>
          </div>
        </div>
        <div className="mt-10 border-t border-[#f0f0f0] pt-6 text-center text-xs text-[#747474]">
          © {new Date().getFullYear()} Amara Jewelry — {t("copyright")}
        </div>
      </div>
    </footer>
  );
}
