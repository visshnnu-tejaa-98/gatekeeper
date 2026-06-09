import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const config = defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: (globalThis as any).process?.env?.POSTGRES_URI!,
  },
});

export default config;
