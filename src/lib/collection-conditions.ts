import { parseJson } from "@/lib/json";
import type {
  CollectionCondition,
} from "@/lib/validations/collection-admin";

export type CollectionConditionStore = {
  matchType: "ALL" | "ANY";
  conditions: CollectionCondition[];
};

const DEFAULT_STORE: CollectionConditionStore = {
  matchType: "ALL",
  conditions: [],
};

export function parseCollectionConditions(raw: string | null | undefined): CollectionConditionStore {
  if (!raw) return DEFAULT_STORE;
  const parsed = parseJson<Partial<CollectionConditionStore>>(raw, DEFAULT_STORE);
  return {
    matchType: parsed.matchType === "ANY" ? "ANY" : "ALL",
    conditions: Array.isArray(parsed.conditions) ? parsed.conditions : [],
  };
}

function getProductTagList(rawTags: string): string[] {
  return parseJson<string[]>(rawTags, []).map((t) => t.toString().toLowerCase());
}

type ProductForMatch = {
  name: string;
  price: number;
  vendor: string | null;
  tags: string;
  categories: { slug: string; name: string }[];
};

function matchOne(product: ProductForMatch, cond: CollectionCondition): boolean {
  const value = cond.value.trim();
  switch (cond.field) {
    case "price": {
      const v = Number(value);
      if (!Number.isFinite(v)) return false;
      switch (cond.operator) {
        case "gt":
          return product.price > v;
        case "gte":
          return product.price >= v;
        case "lt":
          return product.price < v;
        case "lte":
          return product.price <= v;
        case "eq":
          return product.price === v;
        default:
          return false;
      }
    }
    case "tag": {
      const tags = getProductTagList(product.tags);
      const needle = value.toLowerCase();
      switch (cond.operator) {
        case "eq":
          return tags.includes(needle);
        case "contains":
          return tags.some((t) => t.includes(needle));
        default:
          return false;
      }
    }
    case "vendor": {
      const v = (product.vendor ?? "").toLowerCase();
      const needle = value.toLowerCase();
      switch (cond.operator) {
        case "eq":
          return v === needle;
        case "contains":
          return v.includes(needle);
        default:
          return false;
      }
    }
    case "name": {
      const v = product.name.toLowerCase();
      const needle = value.toLowerCase();
      switch (cond.operator) {
        case "eq":
          return v === needle;
        case "contains":
          return v.includes(needle);
        default:
          return false;
      }
    }
    case "category": {
      const slugs = product.categories.map((c) => c.slug.toLowerCase());
      const names = product.categories.map((c) => c.name.toLowerCase());
      const needle = value.toLowerCase();
      switch (cond.operator) {
        case "eq":
          return slugs.includes(needle) || names.includes(needle);
        case "contains":
          return slugs.some((s) => s.includes(needle)) || names.some((n) => n.includes(needle));
        default:
          return false;
      }
    }
    default:
      return false;
  }
}

export function matchesAutomaticCollection(
  product: ProductForMatch,
  store: CollectionConditionStore,
): boolean {
  if (store.conditions.length === 0) return false;
  if (store.matchType === "ANY") {
    return store.conditions.some((c) => matchOne(product, c));
  }
  return store.conditions.every((c) => matchOne(product, c));
}
