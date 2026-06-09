import z from "zod";
import {
  ALLOWED_FILE_TYPES,
  ALLOWED_ROLES,
  MAX_AVATAR_FILE_SIZE,
  USER,
} from "../../common/constants";

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .describe("Full name of the registrant"),
  email: z.string().email().lowercase().describe("Email of the registrant"),
  password: z
    .string()
    .trim()
    .min(8)
    .max(100)
    .describe("Password of the regsitrant"),
  role: z.enum(ALLOWED_ROLES).default(USER),
});

type RegisterInputType = z.infer<typeof registerSchema>;

const verifyEmailSchema = z.object({
  token: z
    .string()
    .trim()
    .describe("Verification email token of the registrant"),
});

type VerificationEmailSchemaType = z.infer<typeof verifyEmailSchema>;

const loginSchema = z.object({
  email: z.string().email().lowercase().describe("Email of the registrant"),
  password: z
    .string()
    .trim()
    .min(8)
    .max(100)
    .describe("Password of the regsitrant"),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

const forgotPasswordSchema = z.object({
  email: z.string().email().lowercase().describe("Email of the registrant"),
});

type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;

const resetPasswordSchemaFromBody = z.object({
  password: z
    .string()
    .trim()
    .min(8)
    .max(100)
    .describe("Password of the regsitrant"),
});

type ResetPasswordSchemaFromBodyType = z.infer<
  typeof resetPasswordSchemaFromBody
>;

const resetPasswordSchemaFromParams = z.object({
  token: z.string().trim().describe("Reset Password token of the registrant"),
});

type ResetPasswordSchemaFromParamsType = z.infer<
  typeof resetPasswordSchemaFromParams
>;

const uploadAvatarSchema = z
  .object({
    size: z.number(),
    mimetype: z.string(),
    buffer: z.instanceof(Buffer),
  })
  .refine((file) => file.size <= MAX_AVATAR_FILE_SIZE, "Max image size is 5MB")
  .refine(
    (file) => ALLOWED_FILE_TYPES.includes(file.mimetype),
    "Only png, jpeg and pdf files are supported",
  );

type UploadAvatarSchemaType = z.infer<typeof uploadAvatarSchema>;

export {
  registerSchema,
  verifyEmailSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchemaFromBody,
  resetPasswordSchemaFromParams,
  uploadAvatarSchema,
};
export type {
  RegisterInputType,
  VerificationEmailSchemaType,
  LoginSchemaType,
  ForgotPasswordSchemaType,
  ResetPasswordSchemaFromBodyType,
  ResetPasswordSchemaFromParamsType,
  UploadAvatarSchemaType,
};
