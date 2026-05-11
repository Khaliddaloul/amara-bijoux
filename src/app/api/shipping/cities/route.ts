import { NextResponse } from "next/server";
import { parseJson } from "@/lib/json";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const zones = await prisma.shippingZone.findMany({
    where: { isActive: true },
    select: { regions: true },
  });
  const set = new Set<string>();
  for (const z of zones) {
    const regions = parseJson<string[]>(z.regions, []);
    for (const c of regions) {
      const t = c.trim();
      if (t) set.add(t);
    }
  }
  const cities = Array.from(set).sort((a, b) => a.localeCompare(b, "ar"));
  return NextResponse.json({ cities });
}
