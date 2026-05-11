import {
  ReviewsTable,
  type ReviewRow,
} from "@/components/admin/reviews/reviews-table";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const filter = searchParams?.status;
  const where =
    filter === "pending"
      ? { isApproved: false }
      : filter === "approved"
        ? { isApproved: true }
        : undefined;

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 500,
    include: {
      product: { select: { id: true, name: true, slug: true } },
      customer: true,
    },
  });

  const rows: ReviewRow[] = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    isApproved: r.isApproved,
    customerLabel:
      r.guestName ??
      ([r.customer?.firstName, r.customer?.lastName].filter(Boolean).join(" ").trim() || "عميلة"),
    customerEmail: r.guestEmail ?? r.customer?.email ?? null,
    productId: r.product.id,
    productName: r.product.name,
    productSlug: r.product.slug,
    createdAt: r.createdAt,
  }));

  const pendingCount = await prisma.review.count({ where: { isApproved: false } });
  const approvedCount = await prisma.review.count({ where: { isApproved: true } });

  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">المراجعات</h1>
        <p className="text-sm text-muted-foreground">
          الموافقة، الرفض، أو حذف المراجعات الواردة من العملاء.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        <a
          href="/admin/reviews"
          className={`rounded-md border px-3 py-1.5 ${!filter ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
        >
          الكل ({rows.length})
        </a>
        <a
          href="/admin/reviews?status=pending"
          className={`rounded-md border px-3 py-1.5 ${filter === "pending" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
        >
          في انتظار ({pendingCount})
        </a>
        <a
          href="/admin/reviews?status=approved"
          className={`rounded-md border px-3 py-1.5 ${filter === "approved" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
        >
          موافق ({approvedCount})
        </a>
      </div>
      <ReviewsTable rows={rows} />
    </div>
  );
}
