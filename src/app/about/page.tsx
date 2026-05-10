import Link from "next/link";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <StorefrontShell>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
        <h1 className="text-3xl font-semibold text-black">من نحن</h1>
        <p className="leading-relaxed text-[#4d4d4d]">
          نؤمن بأن المجوهرات ليست مجرد إكسسوار، بل تعبير عن شخصيتك. هذه الصفحة مطابقة لهيكل «من نحن» في المتجر المرجعي مع
          محتوى عربي للاستخدام التجريبي.
        </p>
        <Button asChild variant="outline" className="border-black text-black hover:bg-black hover:text-white">
          <Link href="/pages/about">صفحة المحتوى من لوحة التحكم</Link>
        </Button>
      </div>
    </StorefrontShell>
  );
}
