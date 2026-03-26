import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  CORS_ORIGIN: z.string().url(),
  PORT: z.string().default('3000'),
});

export type Env = z.infer<typeof envSchema>;

export const validateEnv = (rawEnv: Record<string, unknown>): Env => {
  const result = envSchema.safeParse(rawEnv);

  if (!result.success) {
    const errors = result.error.issues.map(e => `  - ${e.path.join('.')}: ${e.message}`).join('\n');
    console.error(`Environment validation failed:\n${errors}`);
    process.exit(1);
  }

  return result.data;
};

let cachedEnv: Env | undefined;

export const getEnv = (): Env => {
  if (!cachedEnv) {
    cachedEnv = validateEnv(process.env);
  }
  return cachedEnv;
};

export { envSchema };
