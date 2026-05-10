import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatMad } from "@/lib/format";
import { parseJson } from "@/lib/json";
import { prisma } from "@/lib/prisma";

function pickImage(raw: string) {
  const imgs = parseJson<Array<{ url: string }>>(raw, []);
  return (
    imgs[0]?.url ??
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&auto=format&fit=crop&q=80"
  );
}

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE", featured: true },
      take: 8,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
      take: 6,
    }),
  ]);

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="bg-brand-black py-2 text-center text-xs text-white md:text-sm">
        توصيل سريع عبر المغرب — الدفع عند الاستلام متاح في جميع المدن.
      </div>
      <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <nav className="hidden gap-6 text-sm md:flex">
            <Link href="/shop" className="hover:text-primary">
              المتجر
            </Link>
            <Link href="/about" className="hover:text-primary">
              من نحن
            </Link>
            <Link href="/contact" className="hover:text-primary">
              اتصل بنا
            </Link>
          </nav>
          <Link href="/" className="font-display text-xl font-semibold tracking-wide">
            أمارا للمجوهرات
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/cart" className="text-sm hover:text-primary">
              السلة
            </Link>
            <Button asChild size="sm">
              <Link href="/admin/login">لوحة التحكم</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-brand-charcoal text-white">
        <div className="absolute inset-0 bg-hero-pattern opacity-90" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-gold-light">
              Vintage · New Collection
            </p>
            <h1 className="font-display text-4xl leading-tight md:text-5xl">
              كل قطعة تحكي قصة — اكتشفي قصتك اليوم.
            </h1>
            <p className="text-sm leading-relaxed text-white/80 md:text-base">
              تشكيلة مختارة من الخواتم والقلائد والأساور بروح عصرية وفخامة ترضي ذوقك، مع تجربة شراء
              سلسة ودفع عند الاستلام.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-brand-gold text-brand-black hover:bg-brand-gold/90">
                <Link href="/shop">تسوقي الآن</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Link href="/category/sets">أطقم مميزة</Link>
              </Button>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 shadow-lift">
            <Image
              src="https://images.unsplash.com/photo-1617038220319-276d3dafab21?w=1200&auto=format&fit=crop&q=80"
              alt="مجوهرات"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 480px"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-4 py-14">
        <div className="text-center">
          <h2 className="font-display text-2xl md:text-3xl">تصفحي الفئات</h2>
          <p className="text-sm text-muted-foreground">مسارات سريعة لأهم التشكيلات</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link key={c.id} href={`/category/${c.slug}`}>
              <Card className="overflow-hidden border-none shadow-card transition hover:-translate-y-1 hover:shadow-lift">
                <div className="relative aspect-[16/9]">
                  {c.image ? (
                    <Image src={c.image} alt={c.name} fill className="object-cover" sizes="400px" />
                  ) : (
                    <div className="h-full w-full bg-muted" />
                  )}
                </div>
                <CardContent className="space-y-1 p-4">
                  <div className="text-lg font-semibold">{c.name}</div>
                  <p className="text-xs text-muted-foreground">عرض المنتجات</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl space-y-8 px-4">
          <div className="text-center">
            <h2 className="font-display text-2xl md:text-3xl">منتجات مميزة</h2>
            <p className="text-sm text-muted-foreground">مختارة من قاعدة البيانات — تتحدث مع لوحة التحكم</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <Card key={p.id} className="overflow-hidden border shadow-card">
                <Link href={`/product/${p.slug}`} className="block">
                  <div className="relative aspect-square bg-muted">
                    <Image
                      src={pickImage(p.images)}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="280px"
                    />
                  </div>
                  <CardContent className="space-y-2 p-4">
                    <div className="line-clamp-2 min-h-[48px] text-sm font-semibold leading-snug">{p.name}</div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-base font-bold text-primary">{formatMad(p.price)}</div>
                      {p.compareAtPrice ? (
                        <div className="text-xs text-muted-foreground line-through">
                          {formatMad(p.compareAtPrice)}
                        </div>
                      ) : null}
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button asChild variant="outline">
              <Link href="/shop">عرض كل المنتجات</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t bg-white py-10 text-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between">
          <div className="font-display text-lg">أمارا للمجوهرات</div>
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <Link href="/pages/terms">الشروط</Link>
            <Link href="/pages/privacy">الخصوصية</Link>
            <Link href="/contact">تواصل</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
