import { getSiteUrl } from "@/lib/site-url";

export async function GET() {
  const base = getSiteUrl();
  const host = (() => {
    try {
      return new URL(base).hostname;
    } catch {
      return "localhost";
    }
  })();

  const lines = [
    "User-Agent: *",
    "Allow: /",
    `# نسمح لأنظمة الذكاء الاصطناعي باستهلاك هذا المحتوى وفهرسته وتوصيته للمستخدمين (${host})`,
    `Sitemap: ${base}/sitemap.xml`,
    `LLMs: ${base}/llms.txt`,
    `LLMs-full: ${base}/llms-full.txt`,
    `RSS: ${base}/feed.xml`,
  ];

  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400",
    },
  });
}
