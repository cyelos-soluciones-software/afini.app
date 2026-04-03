import { prisma } from "@/lib/prisma";

export function slugify(input: string): string {
  const s = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return s || "campana";
}

export async function ensureUniqueCampaignSlug(baseName: string): Promise<string> {
  let slug = slugify(baseName);
  let n = 0;
  while (await prisma.campaign.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${slugify(baseName)}-${n}`;
  }
  return slug;
}
