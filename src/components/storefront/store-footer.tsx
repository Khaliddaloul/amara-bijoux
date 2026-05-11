import Link from "next/link";
import { STORE_FACTS } from "@/lib/constants/store-seo";

type FootLink = { id: string; label: string; url: string };

/** Footer columns from DB menu items + حقائق عن المتجر */
export function StoreFooter({
  columns,
  productCount,
  storeDisplayName,
  contactEmail,
  contactPhone,
  addressLine,
}: {
  columns: FootLink[][];
  productCount?: number;
  /** من إعدادات المتجر — يظهر في حقوق النشر والعنوان */
  storeDisplayName?: string;
  contactEmail?: string;
  contactPhone?: string;
  addressLine?: string;
}) {
  const nonEmpty = columns.filter((c) => c.length > 0);

  return (
    <footer className="border-t border-[#f0f0f0] bg-[#fefefe] text-black">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <section aria-labelledby="store-facts-heading" className="mb-12 rounded-xl border border-[#f0f0f0] bg-white p-6">
          <h2 id="store-facts-heading" className="text-lg font-semibold text-black">
            حقائق عن المتجر
          </h2>
          <dl className="mt-4 grid gap-4 text-sm text-[#4d4d4d] sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="font-medium text-black">البلد</dt>
              <dd>{STORE_FACTS.country}</dd>
            </div>
            <div>
              <dt className="font-medium text-black">الخبرة</dt>
              <dd>أكثر من {STORE_FACTS.yearsExperience} سنوات في اختيار التصاميم</dd>
            </div>
            <div>
              <dt className="font-medium text-black">العملاء</dt>
              <dd>أكثر من {STORE_FACTS.happyCustomers.toLocaleString("ar-MA")} عميلة سجّلت تجربتها معنا</dd>
            </div>
            <div>
              <dt className="font-medium text-black">المنتجات</dt>
              <dd>
                {typeof productCount === "number"
                  ? `${productCount.toLocaleString("ar-MA")} منتجاً نشطاً في المتجر`
                  : STORE_FACTS.productsLabel}
              </dd>
            </div>
          </dl>
        </section>

        {nonEmpty.length > 0 ? (
          <div className={`grid gap-10 ${nonEmpty.length > 1 ? "sm:grid-cols-2" : ""}`}>
            {nonEmpty.map((col, ci) => (
              <div key={ci} className="space-y-4">
                <h3 className="text-sm font-semibold">{ci === 0 ? "روابط" : "المزيد"}</h3>
                <ul className="space-y-2 text-sm text-[#696969]">
                  {col.map((item) => (
                    <li key={item.id}>
                      <Link href={item.url} className="hover:text-black hover:underline">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-[#696969]">روابط الفوتر تُدار من لوحة التحكم.</p>
        )}

        <section className="mt-12 border-t border-[#f0f0f0] pt-10">
          <h3 className="text-sm font-semibold text-black">أسئلة سريعة</h3>
          <ul className="mt-4 space-y-2 text-sm text-[#696969]">
            <li>
              <Link href="/pages/faq" className="hover:text-black hover:underline">
                الأسئلة الشائعة الكاملة
              </Link>
            </li>
            <li>
              <Link href="/pages/shipping-returns" className="hover:text-black hover:underline">
                الشحن والإرجاع
              </Link>
            </li>
          </ul>
          <address className="mt-8 not-italic text-sm text-[#696969]">
            تواصل:{" "}
            <a
              href={`mailto:${contactEmail ?? "contact@amara.ma"}`}
              className="text-black underline"
            >
              {contactEmail ?? "contact@amara.ma"}
            </a>{" "}
            — هاتف وواتساب: {contactPhone ?? "+212600000000"}
            {addressLine ? ` — ${addressLine}` : " — الدار البيضاء، المغرب."}
          </address>
        </section>

        <div className="mt-10 border-t border-[#f0f0f0] pt-6 text-center text-xs text-[#747474]">
          © {new Date().getFullYear()} {storeDisplayName ?? "أمارا للمجوهرات"} — مجوهرات مغربية فاخرة.
        </div>
      </div>
    </footer>
  );
}
