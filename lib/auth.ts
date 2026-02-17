import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true, // Required for development
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing email or password');
          return null;
        }

        try {
          console.log('Attempting login for:', credentials.email);
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user) {
            console.log('User not found:', credentials.email);
            return null;
          }

          console.log('User found, checking password...');
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          console.log('Password valid:', isPasswordValid);
          if (!isPasswordValid) {
            console.log('Invalid password for:', credentials.email);
            return null;
          }

          console.log('Login successful for:', credentials.email);
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as Role;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});

