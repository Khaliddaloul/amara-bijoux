import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/json";

export async function getSettingRecord() {
  const rows = await prisma.setting.findMany();
  const map: Record<string, unknown> = {};
  for (const r of rows) {
    try {
      map[r.key] = JSON.parse(r.value);
    } catch {
      map[r.key] = r.value;
    }
  }
  return map;
}

export type GeneralSettings = {
  storeName: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  currency: string;
};

export async function getGeneralSettings(): Promise<GeneralSettings> {
  const rows = await prisma.setting.findMany({ where: { key: "general" } });
  const raw = rows[0]?.value;
  return parseJson<GeneralSettings>(raw, {
    storeName: "أمارا للمجوهرات",
    logo: "",
    favicon: "",
    primaryColor: "#c9a24d",
    currency: "MAD",
  });
}

export async function getAnnouncement(): Promise<string> {
  const rows = await prisma.setting.findMany({ where: { key: "announcement" } });
  if (!rows[0]) return "";
  try {
    return JSON.parse(rows[0].value) as string;
  } catch {
    return rows[0].value;
  }
}
