import { parseJson } from "@/lib/json";
import { prisma } from "@/lib/prisma";

export type ShippingRateRow = {
  name: string;
  price: number;
  minOrder: number;
  maxOrder?: number | null;
};

export type ResolvedShippingRate = {
  id: string;
  name: string;
  price: number;
  minOrder: number;
  maxOrder: number | null;
  estimatedDays: number | null;
};

export type ResolveShippingResult = {
  zone: { id: string; name: string } | null;
  cheapestRate: ResolvedShippingRate | null;
  applicableRates: ResolvedShippingRate[];
};

function mapRate(r: {
  id: string;
  name: string;
  price: number;
  minOrder: number;
  maxOrder: number | null;
  estimatedDays: number | null;
}): ResolvedShippingRate {
  return {
    id: r.id,
    name: r.name,
    price: r.price,
    minOrder: r.minOrder,
    maxOrder: r.maxOrder,
    estimatedDays: r.estimatedDays,
  };
}

function cityMatches(regions: string[], normalized: string) {
  return regions.some(
    (r) => normalized.includes(r) || r.includes(normalized) || normalized === r,
  );
}

function fallbackPrice(subtotal: number) {
  return subtotal > 500 ? 0 : 35;
}

/** Pick best matching legacy JSON rates (used only if relational rates missing). */
export function pickRateForSubtotal(rates: ShippingRateRow[], subtotal: number): number {
  if (!rates.length) return fallbackPrice(subtotal);
  const sorted = [...rates].sort((a, b) => b.minOrder - a.minOrder);
  for (const r of sorted) {
    const max = r.maxOrder ?? null;
    if (subtotal >= r.minOrder && (max == null || subtotal <= max)) return r.price;
  }
  return sorted[sorted.length - 1]?.price ?? fallbackPrice(subtotal);
}

export async function resolveShippingForCheckout(
  city: string,
  subtotal: number,
): Promise<ResolveShippingResult> {
  const normalized = city.trim();
  const zones = await prisma.shippingZone.findMany({
    where: { isActive: true },
    include: { rates: { orderBy: { price: "asc" } } },
  });

  for (const zone of zones) {
    const regions = parseJson<string[]>(zone.regions, []);
    if (!cityMatches(regions, normalized)) continue;

    const applicable = zone.rates
      .filter(
        (r) => subtotal >= r.minOrder && (r.maxOrder == null || subtotal <= r.maxOrder),
      )
      .sort((a, b) => a.price - b.price);

    const mapped = applicable.map(mapRate);
    return {
      zone: { id: zone.id, name: zone.name },
      cheapestRate: mapped[0] ?? null,
      applicableRates: mapped,
    };
  }

  const fb = fallbackPrice(subtotal);
  const synthetic: ResolvedShippingRate = {
    id: "fallback",
    name: "افتراضي",
    price: fb,
    minOrder: 0,
    maxOrder: null,
    estimatedDays: null,
  };
  return {
    zone: null,
    cheapestRate: synthetic,
    applicableRates: [synthetic],
  };
}

/** Legacy helper — returns MAD shipping amount for quote API & orders. */
export async function calculateShippingCost(city: string, subtotal: number): Promise<number> {
  const res = await resolveShippingForCheckout(city, subtotal);
  return res.cheapestRate?.price ?? fallbackPrice(subtotal);
}

/** Distinct city names from active shipping zones (for checkout select). */
export async function listShippingCities(): Promise<string[]> {
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
  return Array.from(set).sort((a, b) => a.localeCompare(b, "ar"));
}
