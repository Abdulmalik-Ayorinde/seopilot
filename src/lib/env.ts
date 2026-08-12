import { z } from "zod";

const envSchema = z.object({
  GSC_SERVICE_ACCOUNT_EMAIL: z.string().email(),
  GSC_SERVICE_ACCOUNT_KEY: z.string().min(1),
  GSC_PROPERTY_URL: z.string().url(),
  SQLITE_PATH: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;
  cachedEnv = envSchema.parse(process.env);
  return cachedEnv;
}
