/**
 * NextAuth v5: JWT, PrismaAdapter (cuentas Google), credenciales (líderes y súper admin; admin de campaña solo Google en producción).
 */
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const googleConfigured =
  typeof process.env.GOOGLE_CLIENT_ID === "string" &&
  process.env.GOOGLE_CLIENT_ID.length > 0 &&
  typeof process.env.GOOGLE_CLIENT_SECRET === "string" &&
  process.env.GOOGLE_CLIENT_SECRET.length > 0;

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/login" },
  providers: [
    ...(googleConfigured
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: false,
          }),
        ]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) {
          if (process.env.NODE_ENV === "development") {
            console.warn("[auth] credentials: datos inválidos", parsed.error.flatten());
          }
          return null;
        }
        const email = parsed.data.email.trim().toLowerCase();
        const password = parsed.data.password.trim();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          if (process.env.NODE_ENV === "development") {
            console.warn(`[auth] credentials: no existe usuario "${email}" (¿ejecutaste npm run db:seed?)`);
          }
          return null;
        }
        if (!user.passwordHash) {
          if (process.env.NODE_ENV === "development") {
            console.warn(`[auth] credentials: "${email}" no tiene contraseña (usa Google u otro método).`);
          }
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          if (process.env.NODE_ENV === "development") {
            console.warn(`[auth] credentials: contraseña incorrecta para "${email}"`);
          }
          return null;
        }

        if (user.role === "CAMPAIGN_ADMIN" && process.env.NODE_ENV === "production") {
          return null;
        }

        if (user.role !== "LEADER" && user.role !== "SUPER_ADMIN" && user.role !== "CAMPAIGN_ADMIN") {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role as UserRole,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;
      const email = profile?.email?.toLowerCase()?.trim();
      if (!email) return "/login?error=GoogleSinCorreo";
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.role !== "CAMPAIGN_ADMIN") {
        return "/login?error=GoogleSoloAdministradores";
      }
      return true;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: UserRole }).role;
        token.email = user.email;
      }
      return token;
    },
    session: async ({ session, token }) => {
      const uid = token.id as string | undefined;
      if (!uid || !session.user) return session;
      const db = await prisma.user.findUnique({
        where: { id: uid },
        select: { email: true, role: true },
      });
      if (db) {
        session.user.id = uid;
        session.user.email = db.email;
        session.user.role = db.role;
      }
      return session;
    },
  },
});
