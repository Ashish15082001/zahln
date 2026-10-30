import { z } from "zod";

export const ApiEnvSchema = z.object({
  VITE_API_BASE_URL: z.url(),
  VITE_CANDIDATE_ID: z.string().min(1),
});

export interface ApiEnv extends z.infer<typeof ApiEnvSchema> {}

/** What every surface needs to reach the API. */
export interface ApiConfig {
  baseUrl: string;
  candidateId: string;
}

/**
 * Reads the API settings from Vite's env. Each app's vite.config.ts calls this
 * too, so a build without a candidate ID fails on the laptop instead of
 * shipping an APK that gets 403 on every request.
 */
export const parseApiEnv = (env: unknown): ApiConfig => {
  const result = ApiEnvSchema.safeParse(env);
  if (!result.success) {
    throw new Error(
      `Missing or invalid API settings. Copy .env.example to .env at the repo root.\n${z.prettifyError(result.error)}`,
    );
  }

  return {
    // Paths are joined as `${baseUrl}/orders`; a trailing slash would double it.
    baseUrl: result.data.VITE_API_BASE_URL.replace(/\/+$/, ""),
    candidateId: result.data.VITE_CANDIDATE_ID,
  };
};
