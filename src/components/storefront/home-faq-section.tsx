import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { STORE_FAQ_ITEMS } from "@/lib/constants/faq";

export async function HomeFaqSection() {
  const t = await getTranslations("homeFaq");
  const items = STORE_FAQ_ITEMS.slice(0, 8);

  return (
    <section className="border-y border-[#f0f0f0] bg-[#fafafa] py-14" aria-labelledby="home-faq-heading">
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center">
          <h2 id="home-faq-heading" className="text-2xl font-semibold text-black">
            {t("heading")}
          </h2>
          <p className="mt-2 text-sm text-[#696969]">{t("subheading")}</p>
        </div>
        <dl className="mt-10 space-y-6">
          {items.map((item) => (
            <div key={item.question} className="rounded-xl border border-[#f0f0f0] bg-white p-5 shadow-sm">
              <dt className="font-semibold text-black">{item.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-[#4d4d4d]">{item.answer}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-10 text-center">
          <Link href="/pages/faq" className="text-sm font-medium text-black underline-offset-4 hover:underline">
            {t("viewAll")}
          </Link>
        </div>
      </div>
    </section>
  );
}
