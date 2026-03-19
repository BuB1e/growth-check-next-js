import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const EnvConfig = createEnv({
    server: {
        BACKEND_ENDPOINT: z.url(),
        MOCK_USER_ID: z.string().min(1).optional(),
        AI_PREDICTION_POLL_INITIAL_MS: z.coerce.number().int().positive(),
        AI_PREDICTION_POLL_BACKOFF_FACTOR: z.coerce.number().gt(1),
        AI_PREDICTION_POLL_MAX_MS: z.coerce.number().int().positive(),
        AI_PREDICTION_POLL_TIMEOUT_MS: z.coerce.number().int().positive(),
        AI_PREDICTION_POLL_HIDDEN_MIN_MS: z.coerce.number().int().positive(),
        AI_PREDICTION_POLL_JITTER_RATIO: z.coerce.number().min(0).max(1),
    },
    client: {
        NEXT_PUBLIC_BETTER_AUTH_ENDPOINT: z.url(),
        NEXT_PUBLIC_PAGINATION_LIMIT_MOBILE_SIZE: z.coerce.number(),
        NEXT_PUBLIC_PAGINATION_LIMIT_DESKTOP_SIZE: z.coerce.number(),
    },
    runtimeEnv: {
        BACKEND_ENDPOINT: process.env.BACKEND_ENDPOINT,
        MOCK_USER_ID: process.env.MOCK_USER_ID,
        AI_PREDICTION_POLL_INITIAL_MS: process.env.AI_PREDICTION_POLL_INITIAL_MS,
        AI_PREDICTION_POLL_BACKOFF_FACTOR: process.env.AI_PREDICTION_POLL_BACKOFF_FACTOR,
        AI_PREDICTION_POLL_MAX_MS: process.env.AI_PREDICTION_POLL_MAX_MS,
        AI_PREDICTION_POLL_TIMEOUT_MS: process.env.AI_PREDICTION_POLL_TIMEOUT_MS,
        AI_PREDICTION_POLL_HIDDEN_MIN_MS: process.env.AI_PREDICTION_POLL_HIDDEN_MIN_MS,
        AI_PREDICTION_POLL_JITTER_RATIO: process.env.AI_PREDICTION_POLL_JITTER_RATIO,
        NEXT_PUBLIC_BETTER_AUTH_ENDPOINT: process.env.NEXT_PUBLIC_BETTER_AUTH_ENDPOINT,
        NEXT_PUBLIC_PAGINATION_LIMIT_MOBILE_SIZE: process.env.NEXT_PUBLIC_PAGINATION_LIMIT_MOBILE_SIZE,
        NEXT_PUBLIC_PAGINATION_LIMIT_DESKTOP_SIZE: process.env.NEXT_PUBLIC_PAGINATION_LIMIT_DESKTOP_SIZE,
    }
});
