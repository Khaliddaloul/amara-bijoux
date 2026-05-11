import type { Metadata } from "next";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STORE_KEYWORDS } from "@/lib/constants/store-seo";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "اتصل بنا",
    description:
      "تواصلي مع أمارا للمجوهرات — خدمة العملاء، الهاتف، الواتساب والبريد الإلكتروني في الدار البيضاء.",
    canonicalPath: "/contact",
    keywords: [...STORE_KEYWORDS, "اتصل بنا", "خدمة العملاء", "الدار البيضاء"],
    ogImages: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "اتصل بأمارا للمجوهرات" }],
  });
}

export default function ContactPage() {
  return (
    <StorefrontShell>
      <article className="mx-auto max-w-3xl space-y-6 px-4 py-12">
        <header>
          <h1 className="text-3xl font-semibold text-black">اتصل بنا</h1>
          <p className="mt-2 text-sm text-[#696969]">نردّ على استفساراتكم في أقرب وقت خلال أوقات العمل.</p>
        </header>
        <Card className="border-[#f0f0f0]">
          <CardHeader>
            <CardTitle>خدمة العملاء</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-relaxed text-[#4d4d4d]">
            <address className="not-italic">
              <div>الهاتف / واتساب: +212600000000</div>
              <div>
                البريد:{" "}
                <a href="mailto:contact@amara.ma" className="text-black underline">
                  contact@amara.ma
                </a>
              </div>
              <div>الدار البيضاء، المملكة المغربية</div>
            </address>
          </CardContent>
        </Card>
      </article>
    </StorefrontShell>
  );
}
