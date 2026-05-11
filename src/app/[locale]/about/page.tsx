import { Link } from "@/i18n/routing";
import type { Metadata } from "next";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { Button } from "@/components/ui/button";
import { STORE_KEYWORDS } from "@/lib/constants/store-seo";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "من نحن",
    description:
      "تعرّفي على أمارا للمجوهرات — رؤية مغربية للأناقة، واختيار دقيق للقطع، وتجربة شراء عربية بالكامل.",
    canonicalPath: "/about",
    keywords: [...STORE_KEYWORDS, "من نحن", "قصة المتجر"],
    ogImages: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "من نحن — أمارا للمجوهرات" }],
  });
}

export default function AboutPage() {
  return (
    <StorefrontShell>
      <article className="mx-auto max-w-3xl space-y-6 px-4 py-12">
        <header>
          <h1 className="text-3xl font-semibold text-black">من نحن</h1>
        </header>
        <p className="leading-relaxed text-[#4d4d4d]">
          نؤمن بأن المجوهرات ليست مجرد إكسسوار، بل تعبير عن شخصيتك وتكملة لإطلالتكِ في المناسبات واليوميات. نجمع
          بين جودة التصاميم، وأسعاراً شفافة بالدرهم المغربي، وخدمة عملاء تفهم تطلعات المرأة المغربية المعاصرة.
        </p>
        <Button asChild variant="outline" className="border-black text-black hover:bg-black hover:text-white">
          <Link href="/pages/about">صفحة المحتوى التفصيلية</Link>
        </Button>
      </article>
    </StorefrontShell>
  );
}
