export const SUPER_ADMIN = "super_admin";
export const ADMIN = "admin";
export const USER = "user";

export const ALLOWED_ROLES = [SUPER_ADMIN, ADMIN, USER] as const;

export const DEVELOPMENT = "development";
export const PRODUCTION = "production";
export const TEST = "test";

export const envs = [DEVELOPMENT, PRODUCTION, TEST];

export const MAX_AVATAR_FILE_SIZE = 5000000;
export const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg", "image/pdf"];

export const ACCESS_TOKEN = "access_token";
export const REFRESH_TOKEN = "refresh_token";

export const TOKEN_TYPES = [ACCESS_TOKEN, REFRESH_TOKEN];
