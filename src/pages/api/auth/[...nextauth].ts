import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google"
// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "../../../server/env";
import { trpc } from "../../../utils/trpc";
import { PrismaClient } from '@prisma/client'
import { randomUUID } from "crypto";
const prisma = new PrismaClient()
export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.uid;
      }
      return session;
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [

    // ...add more providers here
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "1057630191686-9qughhtmul3hjhfr49d3dqei7ka7oajh.apps.googleusercontent.com",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "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",
    }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        const user = await prisma.user.create({ data: { id: randomUUID(), name: credentials?.username || "", email: "eliott.morcillo@gmail.com" || "", image: "https://avatars.githubusercontent.com/u/64375473?v=4" } })
        return user;
        if (user) {
          // Any object returned will be saved in `user` property of the JWT
          return user
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null

          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      }
    })
  ],
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
};

export default NextAuth(authOptions);
function GitHubProvider(arg0: { clientId: string | undefined; clientSecret: string | undefined; }): import("next-auth/providers").Provider {
  throw new Error("Function not implemented.");
}

