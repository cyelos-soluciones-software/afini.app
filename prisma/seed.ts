/**
 * Datos de desarrollo: usuarios demo (@afini.local), campaña demo, preguntas, misión, líder con token fijo.
 * Al final asigna coordenadas de prueba en Colombia a votantes sin `latitude`/`longitude`.
 * Ejecutar con `npm run db:seed`.
 */
import { BillingPlan, PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { COLOMBIA_CITY_SAMPLES, jitterCoord } from "@/lib/colombia-geo-samples";

const prisma = new PrismaClient();

async function main() {
  const password = process.env.DEV_SEED_PASSWORD ?? "ChangeMe123!";
  const hash = await bcrypt.hash(password, 12);

  const superUser = await prisma.user.upsert({
    where: { email: "super@afini.local" },
    create: {
      email: "super@afini.local",
      passwordHash: hash,
      role: UserRole.SUPER_ADMIN,
      billingPlan: BillingPlan.PREMIUM,
    },
    update: {
      passwordHash: hash,
      role: UserRole.SUPER_ADMIN,
      billingPlan: BillingPlan.PREMIUM,
    },
  });

  const campaign = await prisma.campaign.upsert({
    where: { slug: "demo" },
    create: {
      name: "Campaña Demo",
      slug: "demo",
      slogan: "Juntos por el barrio",
      description:
        "Demostración del funnel y redes de afinidad. Comparte el enlace con wa.me para movilizar sin API de WhatsApp.",
      aiContext:
        "Prioridades de la campaña: escuchar el territorio, soluciones concretas y diálogo respetuoso. No prometer lo que no depende del candidato.",
      maxLeaders: 20,
      maxVoters: 500,
      creatorId: superUser.id,
    },
    update: {
      name: "Campaña Demo",
      slogan: "Juntos por el barrio",
      description:
        "Demostración del funnel y redes de afinidad. Comparte el enlace con wa.me para movilizar sin API de WhatsApp.",
      aiContext:
        "Prioridades de la campaña: escuchar el territorio, soluciones concretas y diálogo respetuoso. No prometer lo que no depende del candidato.",
      maxVoters: 500,
    },
  });

  const qCount = await prisma.question.count({ where: { campaignId: campaign.id } });
  if (qCount === 0) {
    await prisma.question.createMany({
      data: [
        {
          campaignId: campaign.id,
          questionText: "¿Cuál crees que es el mayor problema de tu barrio hoy?",
          officialAnswer:
            "Creemos que la inseguridad percibida y la falta de oportunidades para jóvenes son los frentes donde debemos actuar primero, con presencia en calle y alianzas con la comunidad.",
          geminiContext:
            "Enfatizar enfoque local y participación vecinal; evitar culpar a personas concretas.",
          sortOrder: 0,
        },
        {
          campaignId: campaign.id,
          questionText: "¿Qué te gustaría que el próximo gobierno local priorice en los próximos dos años?",
          officialAnswer:
            "Priorizaremos alumbrado y espacio público seguro, apoyo a mipymes del barrio y canales claros de rendición de cuentas.",
          geminiContext: "Mantener tono constructivo y realista sobre plazos.",
          sortOrder: 1,
        },
      ],
    });
  }

  const leaderUser = await prisma.user.upsert({
    where: { email: "lider@afini.local" },
    create: {
      email: "lider@afini.local",
      passwordHash: hash,
      role: UserRole.LEADER,
    },
    update: {
      role: UserRole.LEADER,
    },
  });

  await prisma.leaderProfile.upsert({
    where: { uniqueUrlToken: "demo-token-1" },
    create: {
      userId: leaderUser.id,
      campaignId: campaign.id,
      uniqueUrlToken: "demo-token-1",
      personalInfo: JSON.stringify({ displayName: "María Líder" }),
    },
    update: {
      campaignId: campaign.id,
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@afini.local" },
    create: {
      email: "admin@afini.local",
      passwordHash: hash,
      role: UserRole.CAMPAIGN_ADMIN,
    },
    update: {
      role: UserRole.CAMPAIGN_ADMIN,
    },
  });

  await prisma.campaignAdmin.upsert({
    where: {
      userId_campaignId: { userId: adminUser.id, campaignId: campaign.id },
    },
    create: { userId: adminUser.id, campaignId: campaign.id },
    update: {},
  });

  const missionCount = await prisma.mission.count({ where: { campaignId: campaign.id } });
  if (missionCount === 0) {
    await prisma.mission.create({
      data: {
        campaignId: campaign.id,
        title: "Misión demo: difusión del funnel",
        messageBody:
          "¡Hola! Participa en nuestra encuesta ciudadana. Tu opinión cuenta para el barrio. (Añade aquí tu enlace personal desde el panel de líder.)",
      },
    });
  }

  const votersSinGeo = await prisma.voter.findMany({
    where: { OR: [{ latitude: null }, { longitude: null }] },
    select: { id: true },
  });
  for (let i = 0; i < votersSinGeo.length; i++) {
    const city = COLOMBIA_CITY_SAMPLES[i % COLOMBIA_CITY_SAMPLES.length];
    const { lat, lng } = jitterCoord(city.lat, city.lng);
    await prisma.voter.update({
      where: { id: votersSinGeo[i].id },
      data: { latitude: lat, longitude: lng },
    });
  }
  if (votersSinGeo.length > 0) {
    console.log(
      `Geolocalización de prueba (Colombia, ciudades repartidas): ${votersSinGeo.length} votante(s) sin coordenadas actualizado(s).`,
    );
  }

  console.log(`Semilla OK: super@afini.local, admin@afini.local, lider@afini.local (misma contraseña por defecto).`);
  console.log(`Funnel demo: /c/${campaign.slug}/demo-token-1`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
