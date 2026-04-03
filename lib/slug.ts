/**
 * Slugs únicos para campañas (URL y rutas públicas del funnel).
 * @packageDocumentation
 */
import { prisma } from "@/lib/prisma";

/**
 * Normaliza texto a slug ASCII (minúsculas, sin acentos, guiones).
 * @param input - Nombre u otro texto fuente.
 */
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

/**
 * Genera un slug no colisionante con `Campaign.slug` existentes.
 * @param baseName - Típicamente el nombre de la campaña.
 */
export async function ensureUniqueCampaignSlug(baseName: string): Promise<string> {
  let slug = slugify(baseName);
  let n = 0;
  while (await prisma.campaign.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${slugify(baseName)}-${n}`;
  }
  return slug;
}
