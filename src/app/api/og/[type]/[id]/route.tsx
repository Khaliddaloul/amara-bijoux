import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { pickProductImageUrl } from "@/lib/images";

export const runtime = "nodejs";

const STORE_BRAND = "أمارا للمجوهرات";

async function fetchCairoBold(): Promise<ArrayBuffer | null> {
  try {
    const ua =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
    const css = await fetch("https://fonts.googleapis.com/css2?family=Cairo:wght@700&display=swap", {
      headers: { "User-Agent": ua },
      next: { revalidate: 86400 },
    }).then((r) => r.text());
    const m = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/);
    if (!m?.[1]) return null;
    return fetch(m[1], { next: { revalidate: 86400 } }).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { type: string; id: string } },
) {
  const base = getSiteUrl();
  const { type, id } = params;

  const cairo = await fetchCairoBold();

  if (type === "product") {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { categories: { take: 1 } },
    });
    if (!product || product.status !== "ACTIVE") {
      return new Response("Not found", { status: 404 });
    }
    const imgPath = pickProductImageUrl(product.images);
    const imgAbs = imgPath.startsWith("http") ? imgPath : `${base}${imgPath}`;
    const cat = product.categories[0]?.name ?? "مجوهرات";
    const title = product.name;
    const price = `${product.price} د.م.`;

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "row-reverse",
            background: "linear-gradient(135deg,#0c0c0c 0%,#2d2420 50%,#1a1512 100%)",
            color: "#fff",
          }}
        >
          <div
            style={{
              width: "52%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- next/og يعتمد على عنصر img */}
            <img
              src={imgAbs}
              alt=""
              width={630}
              height={630}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.95,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(90deg, rgba(12,12,12,0.92) 0%, rgba(12,12,12,0.45) 55%, transparent 100%)",
              }}
            />
          </div>
          <div
            style={{
              width: "48%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "48px 40px 48px 24px",
              gap: 18,
            }}
          >
            <div style={{ fontSize: 22, color: "#c9a24d", fontWeight: 700 }}>{STORE_BRAND}</div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.78)" }}>{cat}</div>
            <div
              style={{
                fontSize: 46,
                fontWeight: 700,
                lineHeight: 1.25,
                textAlign: "right",
                fontFamily: cairo ? "Cairo" : "system-ui",
              }}
            >
              {title}
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, color: "#00bf0e" }}>{price}</div>
            <div style={{ fontSize: 18, color: "rgba(255,255,255,0.55)", marginTop: 16 }}>
              {HOST_HINT(base)}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: cairo
          ? [{ name: "Cairo", data: cairo, weight: 700 as const, style: "normal" as const }]
          : [],
      },
    );
  }

  if (type === "article") {
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post || !post.isPublished) {
      return new Response("Not found", { status: 404 });
    }
    const fi = post.featuredImage
      ? post.featuredImage.startsWith("http")
        ? post.featuredImage
        : `${base}${post.featuredImage}`
      : `${base}/og-default.jpg`;

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "row-reverse",
            background: "#0a0a0a",
            color: "#fff",
          }}
        >
          <div style={{ width: "48%", height: "100%", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fi} alt="" width={630} height={630} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(90deg, rgba(10,10,10,0.95) 0%, transparent 70%)",
              }}
            />
          </div>
          <div
            style={{
              width: "52%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: 48,
              gap: 16,
            }}
          >
            <div style={{ fontSize: 20, color: "#c9a24d", fontWeight: 700 }}>مدونة {STORE_BRAND}</div>
            <div
              style={{
                fontSize: 42,
                fontWeight: 700,
                lineHeight: 1.25,
                textAlign: "right",
                fontFamily: cairo ? "Cairo" : "system-ui",
              }}
            >
              {post.title}
            </div>
            {post.author ? (
              <div style={{ fontSize: 18, color: "rgba(255,255,255,0.65)" }}>{post.author}</div>
            ) : null}
            <div style={{ fontSize: 17, color: "rgba(255,255,255,0.45)", marginTop: 24 }}>{HOST_HINT(base)}</div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: cairo
          ? [{ name: "Cairo", data: cairo, weight: 700 as const, style: "normal" as const }]
          : [],
      },
    );
  }

  if (type === "category") {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return new Response("Not found", { status: 404 });
    }
    const bg =
      category.image && category.image.startsWith("http")
        ? category.image
        : category.image
          ? `${base}${category.image}`
          : `${base}/og-default.jpg`;

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            background: "#111",
            position: "relative",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bg} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.45 }} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, transparent 20%, rgba(0,0,0,0.92) 100%)",
            }}
          />
          <div style={{ position: "relative", padding: 48, gap: 12 }}>
            <div style={{ fontSize: 22, color: "#c9a24d", fontWeight: 700 }}>فئة — {STORE_BRAND}</div>
            <div
              style={{
                fontSize: 52,
                fontWeight: 700,
                color: "#fff",
                textAlign: "right",
                fontFamily: cairo ? "Cairo" : "system-ui",
              }}
            >
              {category.name}
            </div>
            <div style={{ fontSize: 18, color: "rgba(255,255,255,0.55)", marginTop: 8 }}>{HOST_HINT(base)}</div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: cairo
          ? [{ name: "Cairo", data: cairo, weight: 700 as const, style: "normal" as const }]
          : [],
      },
    );
  }

  return new Response("Unsupported type", { status: 400 });
}

function HOST_HINT(base: string) {
  try {
    return new URL(base).hostname.replace(/^www\./, "");
  } catch {
    return "amara-bijoux.ma";
  }
}
