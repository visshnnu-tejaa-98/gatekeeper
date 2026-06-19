import { readFileSync } from "node:fs";
import path from "node:path";
import { env } from "../zod/env";

const fromEnv = (raw: string | undefined) =>
  raw?.includes("BEGIN") ? raw.replace(/\\n/g, "\n") : raw;

export const PUBLIC_KEY =
  fromEnv(env.PUBLIC_KEY) ??
  readFileSync(
    path.join(__dirname, "../../../../certs/public-key.pub"),
    "utf-8",
  );

export const PRIVATE_KEY =
  fromEnv(env.PRIVATE_KEY) ??
  readFileSync(
    path.join(__dirname, "../../../../certs/private-key.pem"),
    "utf-8",
  );
