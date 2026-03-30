// SSR BetterAuth

import { EnvConfig } from "@/configs/BackendConfig";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { lastLoginMethod } from "better-auth/plugins";

export const auth = betterAuth({
    baseURL: EnvConfig.BACKEND_ENDPOINT, // The backend is the source of truth
    secret: EnvConfig.BETTER_AUTH_SECRET, // Should be same as backend
    plugins: [
        lastLoginMethod(),
        nextCookies()
    ] // make sure nextCookies is the last plugin in the array
})
