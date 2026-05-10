import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <h1 className="font-display text-3xl">عن أمارا</h1>
      <p className="leading-relaxed text-muted-foreground">
        نؤمن بأن المجوهرات ليست مجرد إكسسوار، بل تعبير عن شخصيتك. نختار قطعاً عملية وفاخرة في آن واحد، مع تجربة
        شراء موثوقة عبر المغرب.
      </p>
      <Button asChild variant="outline">
        <Link href="/pages/about">صفحة المحتوى الكامل من لوحة التحكم</Link>
      </Button>
    </div>
  );
}
