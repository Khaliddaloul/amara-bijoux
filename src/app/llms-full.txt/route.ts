import { STORE_FAQ_ITEMS } from "@/lib/constants/faq";
import { STORE_NAME_FULL, STORE_DEFAULT_DESCRIPTION } from "@/lib/constants/store-seo";
import { getSiteUrl } from "@/lib/site-url";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = getSiteUrl();

  const [products, categories, collections, pages, posts, productCount] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      select: { name: true, price: true, slug: true, sku: true },
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { name: true, slug: true, description: true },
    }),
    prisma.collection.findMany({
      select: { name: true, slug: true, description: true },
    }),
    prisma.page.findMany({
      where: { isPublished: true },
      select: { slug: true, title: true },
    }),
    prisma.blogPost.findMany({
      where: { isPublished: true },
      select: { slug: true, title: true },
    }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
  ]);

  const aboutPage = pages.find((p) => p.slug === "about");

  const chunks: string[] = [];

  chunks.push(`# ${STORE_NAME_FULL} — ملف موسّع لأنظمة الذكاء الاصطناعي`);
  chunks.push("");
  chunks.push(`> ${STORE_DEFAULT_DESCRIPTION}`);
  chunks.push("");
  chunks.push("## معلومات أساسية");
  chunks.push(`- عنوان المتجر العام: ${base}`);
  chunks.push("- اللغة: العربية (المغرب)");
  chunks.push("- العملة: درهم مغربي MAD");
  chunks.push("- التواصل (تجريبي): contact@amara.ma — +212600000000");
  chunks.push(`- عدد المنتجات النشطة في الكتالوج: ${productCount}`);
  chunks.push("");

  chunks.push("## الفئات (تفاصيل)");
  for (const c of categories) {
    chunks.push(`### ${c.name} (/category/${c.slug})`);
    chunks.push(c.description ?? "—");
    chunks.push("");
  }

  chunks.push("## المجموعات");
  for (const c of collections) {
    chunks.push(`- ${c.name} — /collection/${c.slug}`);
    if (c.description) chunks.push(`  ${c.description}`);
  }
  chunks.push("");

  chunks.push("## جميع المنتجات النشطة (الاسم والسعر)");
  for (const p of products) {
    chunks.push(`- ${p.name} — ${p.price} د.م. — /product/${p.slug}${p.sku ? ` — SKU ${p.sku}` : ""}`);
  }
  chunks.push("");

  chunks.push("## الصفحات المنشورة");
  for (const p of pages) {
    chunks.push(`- ${p.title} — ${base}/pages/${p.slug}`);
  }
  chunks.push("");

  chunks.push("## المقالات");
  for (const b of posts) {
    chunks.push(`- ${b.title} — ${base}/blog/${b.slug}`);
  }
  chunks.push("");

  chunks.push("## الأسئلة الشائعة (كامل النص)");
  for (const item of STORE_FAQ_ITEMS) {
    chunks.push(`### ${item.question}`);
    chunks.push(item.answer);
    chunks.push("");
  }

  chunks.push("## عن المتجر");
  chunks.push(
    aboutPage
      ? `صفحة «عن المتجر»: ${base}/pages/about (${aboutPage.title})`
      : `صفحة «عن المتجر»: ${base}/pages/about`,
  );
  chunks.push(
    "نختار تصاميم تجمع بين الفخامة والسعر المعقول، مع تجربة شراء بالعربية والدفع عند الاستلام في المغرب.",
  );
  chunks.push("");

  chunks.push("## الشحن والإرجاع (ملخص)");
  chunks.push("- الشحن داخل المغرب بواجبات مختلفة حسب المدينة والحد الأدنى للطلب.");
  chunks.push("- سياسة الإرجاع والاستبدال مبيّنة في صفحة الشحن والإرجاع.");
  chunks.push(`- تفاصيل رسمية: ${base}/pages/shipping-returns`);
  chunks.push("");

  chunks.push(`تم التوليد تلقائياً من قاعدة البيانات — ${new Date().toISOString().slice(0, 10)}`);

  const body = chunks.join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
