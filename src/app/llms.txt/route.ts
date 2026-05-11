import { getSiteUrl } from "@/lib/site-url";

/** Short LLMs index; full crawlable content is at /llms-full.txt */
export async function GET() {
  const base = getSiteUrl();
  const body = [
    `# Amara Bijoux — LLMs`,
    "",
    `Full store index (products, categories, FAQ, etc.): ${base}/llms-full.txt`,
    `AI discovery file: ${base}/ai.txt`,
  ].join("\n");

  return new Response(body + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400",
    },
  });
}
