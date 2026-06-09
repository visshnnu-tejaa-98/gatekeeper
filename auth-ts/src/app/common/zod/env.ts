import z from "zod";
import { DEVELOPMENT, envs } from "../constants";

const envSchema = z.object({
  PORT: z.coerce.number().default(9000),
  NODE_ENV: z.enum(envs).default(DEVELOPMENT),
  POSTGRES_URI: z.string(),
  BASE_URL: z.string().url(),
  JWT_VERIFY_TOKEN_SECRET: z
    .string()
    .min(1, "JWT_VERIFY_TOKEN_SECRET is required"),
  JWT_VERIFY_TOKEN_EXPIRES: z
    .string()
    .min(1, "JWT_VERIFY_TOKEN_EXPIRES is required"),
  JWT_ACCESS_TOKEN_SECRET: z
    .string()
    .min(1, "JWT_ACCESS_TOKEN_SECRET is required"),
  JWT_ACCESS_TOKEN_EXPIRES: z
    .string()
    .min(1, "JWT_ACCESS_TOKEN_EXPIRESs is required"),
  JWT_REFRESH_TOKEN_SECRET: z
    .string()
    .min(1, "JWT_REFRESH_TOKEN_SECRET is required"),
  JWT_REFRESH_TOKEN_EXPIRES: z
    .string()
    .min(1, "JWT_REFRESH_TOKEN_EXPIRES is required"),
  JWT_RESET_TOKEN_SECRET: z
    .string()
    .min(1, "JWT_RESET_TOKEN_SECRET is required"),
  JWT_RESET_TOKEN_EXPIRES: z
    .string()
    .min(1, "JWT_RESET_TOKEN_EXPIRES is required"),
  NODEMAILER_SMTP_HOST: z.string(),
  NODEMAILER_PORT: z.string(),
  NODEMAILER_EMAIL_USER: z.string().email(),
  NODEMAILER_EMAIL_PASSWORD: z.string(),
  ISSUER_URL: z.string(),
  IMAGEKIT_PRIVATE_KEY: z.string(),
  IMAGEKIT_PUBLIC_KEY: z.string(),
});

const envResult = envSchema.safeParse(process.env);

if (!envResult.success) {
  console.log("ENV Validation error", envResult.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = envResult.data;
export type Env = z.infer<typeof envSchema>;
