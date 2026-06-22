import {
  pgTable,
  varchar,
  boolean,
  timestamp,
  text,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { ADMIN, ALLOWED_ROLES } from "../app/common/constants";

export const userRoleEnum = pgEnum("user_role", ALLOWED_ROLES);

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: userRoleEnum("role").default(ADMIN).notNull(),

  password: text("password"),

  isVerified: boolean("is_verified").default(true),
  verificationToken: text("verification_token"),

  refreshToken: text("refresh_token"),
  resetToken: text("reset_token"),

  avatar: text("avatar"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const applicationsTable = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url").unique(),
  redirectUri: text("redirect_uri"),

  clientId: text("client_id").notNull(),
  clientSecret: text("client_secret"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const shortCodesTable = pgTable("shortcodes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  shortcode: varchar("short_code", { length: 6 }).notNull(),
  clientId: text("client_id").notNull(),
});

export const revokedTokensTable = pgTable("revoked_tokens", {
  jti: text("jti").primaryKey(),
  exp: timestamp("exp").notNull(),
});

export const authorizationCodesTable = pgTable("authorization_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  clientId: text("client_id").notNull(),
  code: varchar("code", { length: 128 }).notNull(),
  codeChallenge: varchar("code_challenge", { length: 128 }),
  codeVerifier: varchar("code_verifier", { length: 128 }),
  algorithm: varchar("algorithm", { length: 25 }),
  used: boolean("used").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
