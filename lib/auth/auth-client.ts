import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_ENDPOINT,
});

export const { useSession, signIn, signUp, signOut } = authClient;
