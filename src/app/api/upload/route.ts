import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const FOLDERS = new Set(["products", "banners", "blog", "categories", "general"]);

async function saveOne(file: File, folder: string) {
  if (!ALLOWED.has(file.type)) {
    return { ok: false as const, error: "صيغة غير مسموحة" };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false as const, error: "الملف أكبر من 5MB" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const relDir = path.join("uploads", folder);
  const uploadDir = path.join(process.cwd(), "public", relDir);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  const url = `/${relDir.replace(/\\/g, "/")}/${filename}`;
  await prisma.media.create({
    data: {
      url,
      name: file.name || filename,
      type: file.type,
      size: file.size,
      folder,
    },
  });

  return { ok: true as const, url };
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const formData = await req.formData();
  const folderRaw = formData.get("folder");
  const folder =
    typeof folderRaw === "string" && FOLDERS.has(folderRaw) ? folderRaw : "general";

  const multi = formData.getAll("files").filter((f): f is File => f instanceof File);
  const single = formData.get("file");

  if (multi.length > 0) {
    const urls: string[] = [];
    for (const file of multi) {
      const res = await saveOne(file, folder);
      if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
      urls.push(res.url);
    }
    return NextResponse.json({ urls });
  }

  if (!(single instanceof File)) {
    return NextResponse.json({ error: "لم يتم إرسال ملف" }, { status: 400 });
  }

  const res = await saveOne(single, folder);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  return NextResponse.json({ url: res.url });
}
