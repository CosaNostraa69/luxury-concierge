import { AuthOptions } from "next-auth"
import { PrismaClient } from '@prisma/client';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import NextAuth, { User } from 'next-auth';

const prisma = new PrismaClient();

interface CustomUser extends User {
  bio?: string;
  role: string;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      bio?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      specialties?: Array<{ id: string; name: string }>;
    }
  }
}

export const authOptions: AuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user) {
          throw new Error('Aucun utilisateur trouvé');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? "",
          role: user.role,
          image: user.image ?? null
        };
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
        session.user.bio = token.bio as string;
        session.user.role = token.role as string;
        session.user.specialties = token.specialties as Array<{ id: string; name: string }>;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }
      if (user) {
        const fullUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { specialties: true }
        });
        
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        token.bio = (user as CustomUser).bio;
        token.role = (user as CustomUser).role;
        token.specialties = fullUser?.specialties || [];
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };