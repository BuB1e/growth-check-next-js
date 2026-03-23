import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// Check if we're in a browser context
const isBrowser = typeof window !== 'undefined';

// Server-only env schema
const serverEnvSchema = {
  server: {
    BACKEND_ENDPOINT: z.url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    AI_PREDICTION_POLL_INITIAL_MS: z.coerce.number().int().positive(),
    AI_PREDICTION_POLL_BACKOFF_FACTOR: z.coerce.number().gt(1),
    AI_PREDICTION_POLL_MAX_MS: z.coerce.number().int().positive(),
    AI_PREDICTION_POLL_TIMEOUT_MS: z.coerce.number().int().positive(),
    AI_PREDICTION_POLL_HIDDEN_MIN_MS: z.coerce.number().int().positive(),
    AI_PREDICTION_POLL_JITTER_RATIO: z.coerce.number().min(0).max(1),
    PAGINATION_LIMIT_MOBILE_SIZE: z.coerce.number(),
    PAGINATION_LIMIT_DESKTOP_SIZE: z.coerce.number(),
  },
  client: {
    // No client-side env variables right now
  },
  runtimeEnv: {
    BACKEND_ENDPOINT: process.env.BACKEND_ENDPOINT,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    AI_PREDICTION_POLL_INITIAL_MS: process.env.AI_PREDICTION_POLL_INITIAL_MS,
    AI_PREDICTION_POLL_BACKOFF_FACTOR: process.env.AI_PREDICTION_POLL_BACKOFF_FACTOR,
    AI_PREDICTION_POLL_MAX_MS: process.env.AI_PREDICTION_POLL_MAX_MS,
    AI_PREDICTION_POLL_TIMEOUT_MS: process.env.AI_PREDICTION_POLL_TIMEOUT_MS,
    AI_PREDICTION_POLL_HIDDEN_MIN_MS: process.env.AI_PREDICTION_POLL_HIDDEN_MIN_MS,
    AI_PREDICTION_POLL_JITTER_RATIO: process.env.AI_PREDICTION_POLL_JITTER_RATIO,
    PAGINATION_LIMIT_MOBILE_SIZE: process.env.PAGINATION_LIMIT_MOBILE_SIZE,
    PAGINATION_LIMIT_DESKTOP_SIZE: process.env.PAGINATION_LIMIT_DESKTOP_SIZE,
  },
};

// Fallback config for client-side (when server env is not available)
const fallbackConfig = {
  BACKEND_ENDPOINT: "",
  BETTER_AUTH_SECRET: "",
  AI_PREDICTION_POLL_INITIAL_MS: 2500,
  AI_PREDICTION_POLL_BACKOFF_FACTOR: 1.7,
  AI_PREDICTION_POLL_MAX_MS: 12000,
  AI_PREDICTION_POLL_TIMEOUT_MS: 90000,
  AI_PREDICTION_POLL_HIDDEN_MIN_MS: 15000,
  AI_PREDICTION_POLL_JITTER_RATIO: 0.2,
  PAGINATION_LIMIT_MOBILE_SIZE: 6,
  PAGINATION_LIMIT_DESKTOP_SIZE: 10,
};

// Use createEnv only in server context, otherwise use fallback
export const EnvConfig = isBrowser 
  ? fallbackConfig 
  : createEnv(serverEnvSchema);
