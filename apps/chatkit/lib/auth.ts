import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { anonymous, customSession } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { user } from "./db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  appName: "ai-chatbot",
  plugins: [
    anonymous({
      emailDomainName: "guest.local",
      generateName: () => `Guest User ${Date.now()}`,
    }),
    nextCookies(),
    customSession(async ({ user: sessionUser, session }) => {
      try {
        const [dbUser] = await db
          .select({ role: user.role, isAnonymous: user.isAnonymous })
          .from(user)
          .where(eq(user.id, session.userId))
          .limit(1);

        // For anonymous users, ensure they have guest role
        const isAnonymous =
          dbUser?.isAnonymous ||
          sessionUser.email?.includes("@guest.local") ||
          false;
        const role = isAnonymous ? "guest" : dbUser?.role || "regular";

        return {
          role,
          user: {
            ...sessionUser,
            role,
            isAnonymous,
          },
          session,
        };
      } catch (error) {
        console.error("Error in customSession:", error);
        // Fallback for anonymous users
        return {
          role: "guest",
          user: {
            ...sessionUser,
            role: "guest",
            isAnonymous: true,
          },
          session,
        };
      }
    }),
  ],
});
