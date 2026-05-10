import Link from "next/link";

/** Footer columns mapped from reference `reference/html/home.html` — Arabic labels. */
export function StoreFooter() {
  return (
    <footer
      className="border-t border-[#f0f0f0] bg-[#fefefe] text-black"
      style={{ borderTopColor: "#f0f0f0", backgroundColor: "#fefefe", color: "#000000" }}
    >
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">الشروط والأحكام</h3>
            <ul className="space-y-2 text-sm text-[#696969]">
              <li>
                <Link href="/pages/terms" className="hover:text-black hover:underline">
                  الشروط والأحكام
                </Link>
              </li>
              <li>
                <Link href="/pages/shipping-returns" className="hover:text-black hover:underline">
                  سياسة الإرجاع
                </Link>
              </li>
              <li>
                <Link href="/pages/privacy" className="hover:text-black hover:underline">
                  سياسة الخصوصية
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">تواصل معنا</h3>
            <ul className="space-y-2 text-sm text-[#696969]">
              <li>
                <Link href="/contact" className="hover:text-black hover:underline">
                  اتصل بنا
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-black hover:underline">
                  الأسئلة الشائعة
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">عن المتجر</h3>
            <ul className="space-y-2 text-sm text-[#696969]">
              <li>
                <Link href="/about" className="hover:text-black hover:underline">
                  من نحن
                </Link>
              </li>
              <li>
                <Link href="/pages/terms" className="hover:text-black hover:underline">
                  طرق الدفع
                </Link>
              </li>
              <li>
                <Link href="/pages/shipping-returns" className="hover:text-black hover:underline">
                  الشحن والتوصيل
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="text-xs leading-relaxed text-[#747474]">
              متجر تجربة RTL مطابق لهيكل المتجر المرجعي — الواجهة العامة فقط؛ لوحة التحكم منفصلة.
            </p>
          </div>
        </div>
        <div className="mt-10 border-t border-[#f0f0f0] pt-6 text-center text-xs text-[#747474]">
          © {new Date().getFullYear()} Amarat-style clone — للتطوير والتعلم.
        </div>
      </div>
    </footer>
  );
}
