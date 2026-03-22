// SSR BetterAuth

import { EnvConfig } from "@/configs/BackendConfig";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    baseURL: EnvConfig.BACKEND_ENDPOINT, // The backend is the source of truth
    secret: EnvConfig.BETTER_AUTH_SECRET, // Should be same as backend
    plugins: [nextCookies()] // make sure this is the last plugin in the array
})
