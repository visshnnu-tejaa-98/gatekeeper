import {
  pgTable,
  varchar,
  boolean,
  date,
  timestamp,
  text,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { ALLOWED_ROLES, USER } from "../app/common/constants";

export const userRoleEnum = pgEnum("user_role", ALLOWED_ROLES);

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: userRoleEnum("role").default(USER).notNull(),

  password: text("password"),

  isVerified: boolean("is_verified").default(false),
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
    .references(() => usersTable.id),
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
    .references(() => usersTable.id),
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
    .references(() => usersTable.id),
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
