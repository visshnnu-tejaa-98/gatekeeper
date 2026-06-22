import z from "zod";
import {
  ADMIN,
  ALLOWED_FILE_TYPES,
  ALLOWED_ROLES,
  MAX_AVATAR_FILE_SIZE,
} from "../../common/constants";

const registerSchema = z.object({
  body: z.object({
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
    role: z.enum(ALLOWED_ROLES).default(ADMIN),
  }),
  query: z.object({
    client_id: z.string().optional(),
  }),
});

const verifyEmailPayloadSchema = z.object({
  body: z.object({
    email: z
      .email()
      .nonempty()
      .describe("email of the user who wants to verify"),
  }),
});

const verifyEmailSchema = z.object({
  body: z.object({
    token: z
      .string()
      .trim()
      .nonempty()
      .describe("Verification email token of the registrant"),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email().lowercase().describe("Email of the registrant"),
    password: z
      .string()
      .trim()
      .min(8)
      .max(100)
      .describe("Password of the regsitrant"),
  }),
  query: z.object({
    client_id: z.string().optional(),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email().lowercase().describe("Email of the registrant"),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    password: z
      .string()
      .trim()
      .min(8)
      .max(100)
      .describe("Password of the regsitrant"),
  }),
  query: z.object({
    token: z.string().trim().describe("Reset Password token of the registrant"),
  }),
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().trim().nonempty().describe("Refresh token"),
  }),
});

const uploadAvatarSchema = z.object({
  file: z
    .object({
      size: z.number(),
      mimetype: z.string(),
      buffer: z.instanceof(Buffer),
    })
    .refine(
      (file) => file.size <= MAX_AVATAR_FILE_SIZE,
      "Max image size is 5MB",
    )
    .refine(
      (file) => ALLOWED_FILE_TYPES.includes(file.mimetype),
      "Only png, jpeg and pdf files are supported",
    ),
});

type RegisterInputType = z.infer<typeof registerSchema>;
type VerifyEmailPayloadSchemaType = z.infer<typeof verifyEmailPayloadSchema>;
type VerificationEmailSchemaType = z.infer<typeof verifyEmailSchema>;
type LoginSchemaType = z.infer<typeof loginSchema>;
type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;
type RefreshTokenSchemaType = z.infer<typeof refreshTokenSchema>;
type UploadAvatarSchemaType = z.infer<typeof uploadAvatarSchema>;

export {
  registerSchema,
  verifyEmailSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  uploadAvatarSchema,
  verifyEmailPayloadSchema,
  refreshTokenSchema,
};
export type {
  RegisterInputType,
  VerificationEmailSchemaType,
  LoginSchemaType,
  ForgotPasswordSchemaType,
  ResetPasswordSchemaType,
  UploadAvatarSchemaType,
  VerifyEmailPayloadSchemaType,
  RefreshTokenSchemaType,
};
