import { ShippingAdminPanel } from "@/components/admin/shipping/shipping-admin-panel";
import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/json";

export default async function ShippingAdminPage() {
  const zones = await prisma.shippingZone.findMany({
    include: { rates: true },
    orderBy: { name: "asc" },
  });

  const rows = zones.map((z) => ({
    id: z.id,
    name: z.name,
    regions: parseJson<string[]>(z.regions, []),
    isActive: z.isActive,
    rates: z.rates.map((r) => ({
      id: r.id,
      name: r.name,
      price: r.price,
      minOrder: r.minOrder,
      maxOrder: r.maxOrder,
      estimatedDays: r.estimatedDays,
    })),
  }));

  return <ShippingAdminPanel initialZones={rows} />;
}
