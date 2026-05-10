/** URL-safe slug; keeps Arabic letters and Latin alphanumeric. */
export function slugFromName(name: string): string {
  const s = name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06FF\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "product";
}
