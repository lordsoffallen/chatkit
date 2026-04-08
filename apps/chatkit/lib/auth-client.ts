import {
  anonymousClient,
  customSessionClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000",
  plugins: [
    inferAdditionalFields<typeof auth>(),
    anonymousClient(),
    customSessionClient<typeof auth>(),
  ],
});
