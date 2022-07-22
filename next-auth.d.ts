import { DefaultSession } from "next-auth";
import type { DefaultUser } from 'next-auth';

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */

  interface Session {
    user?: DefaultUser & {
      id: string;
    };
  }
}

declare module 'next-auth/jwt/types' {
  interface JWT {
    uid: string;
  }
}
interface Session {
  user?: {
    id?: string;
  } & DefaultSession["user"];
}
