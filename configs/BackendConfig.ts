import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const EnvConfig = createEnv({
  server: {
    BACKEND_ENDPOINT: z.url(),
    USE_MOCK_DATA: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
    DEV_MOCK_ROLE: z.enum(["ADMIN", "HEAD", "STAFF"]).default("ADMIN"),
  },
  client: {
    NEXT_PUBLIC_BETTER_AUTH_ENDPOINT: z.url(),
    NEXT_PUBLIC_USE_MOCK_DATA: z.enum(["true", "false"]).default("false"),
  },
  runtimeEnv: {
    BACKEND_ENDPOINT: process.env.BACKEND_ENDPOINT,
    NEXT_PUBLIC_BETTER_AUTH_ENDPOINT:
      process.env.NEXT_PUBLIC_BETTER_AUTH_ENDPOINT,
    USE_MOCK_DATA: process.env.USE_MOCK_DATA,
    DEV_MOCK_ROLE: process.env.DEV_MOCK_ROLE,
    NEXT_PUBLIC_USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA,
  },
});
