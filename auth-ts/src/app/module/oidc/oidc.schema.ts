import { z } from "zod";
import { TOKEN_TYPES } from "../../common/constants";

const registerNewClientDataSchema = z.object({
  body: z.object({
    applicationDisplayName: z
      .string("Application Display Name should be string")
      .trim()
      .nonempty(),
    applicationUrl: z
      .string("Application URL should be string")
      .trim()
      .nonempty(),
    redirectUri: z.string("Redirect URI should be string").trim().nonempty(),
  }),
});

const deleteClientApplicationByClientIdSchema = z.object({
  params: z.object({
    id: z.string().trim().nonempty(),
  }),
});

const getAccessTokenSchema = z.object({
  query: z.object({
    short_code: z.string().nonempty(),
    client_secret: z.string().nonempty(),
  }),
});

const clientCredentialsBaseSchema = z.object({
  body: z.object({
    token: z.string().trim().nonempty(),
    token_type_hint: z.enum(TOKEN_TYPES).optional(),
    client_id: z.string().nonempty(),
    client_secret: z.string().nonempty(),
  }),
});

const rotateSecretParamsSchema = z.object({
  params: z.object({
    id: z.string().trim().nonempty(),
  }),
});

const updateApplicationSchema = z.object({
  body: z
    .object({
      name: z.string().trim().nonempty().optional(),
      redirectUri: z.string().trim().nonempty().optional(),
    })
    .refine(
      (data) => data.name !== undefined || data.redirectUri !== undefined,
      {
        message: "At least one field (name or redirectUri) must be provided",
      },
    ),
  params: z.object({
    id: z.string().trim().nonempty(),
  }),
});

const consentSchema = z.object({
  body: z.object({
    consent_token: z.string().trim().nonempty(),
    client_id: z.string().nonempty(),
    code_challange: z.string().optional(),
    algorithm: z.string().optional(),
  }),
});

const generatTokenSchema = z.object({
  body: z.object({
    code: z.string().trim().nonempty(),
    client_id: z.string().trim().nonempty(),
    algorithm: z.enum(["sha256"]).default("sha256"),
    code_verifier: z.string().trim().nonempty(),
  }),
});

const revokeTokenSchema = clientCredentialsBaseSchema;

const introspectTokenSchema = clientCredentialsBaseSchema;

const getApplicationByIdSchema = z.object({
  params: z.object({
    id: z.string().nonempty(),
  }),
});

const authorizeSchema = z.object({
  query: z.object({
    client_id: z.string().trim().nonempty(),
    code_challange: z.string().trim().nonempty(),
    algorithm: z.enum(["SHA-256"]).default("SHA-256"),
  }),
});

type RegisterNewClientDataSchemaType = z.infer<
  typeof registerNewClientDataSchema
>;

type DeleteClientApplicationByClientIdSchemaType = z.infer<
  typeof deleteClientApplicationByClientIdSchema
>;

type GetAccessTokenSchemaType = z.infer<typeof getAccessTokenSchema>;
type RotateSecretParamsSchemaType = z.infer<typeof rotateSecretParamsSchema>;
type ConsentSchemaType = z.infer<typeof consentSchema>;
type UpdateApplicationSchemaType = z.infer<typeof updateApplicationSchema>;
type GeneratTokenSchemaType = z.infer<typeof generatTokenSchema>;
type RevokeTokenSchemaType = z.infer<typeof revokeTokenSchema>;
type IntrospectTokenSchemaType = z.infer<typeof introspectTokenSchema>;
type GetApplicationByIdSchemaType = z.infer<typeof getApplicationByIdSchema>;
type AuthorizeSchemaType = z.infer<typeof authorizeSchema>;

export {
  registerNewClientDataSchema,
  deleteClientApplicationByClientIdSchema,
  getAccessTokenSchema,
  rotateSecretParamsSchema,
  updateApplicationSchema,
  generatTokenSchema,
  revokeTokenSchema,
  introspectTokenSchema,
  consentSchema,
  getApplicationByIdSchema,
  authorizeSchema,
};
export type {
  RegisterNewClientDataSchemaType,
  DeleteClientApplicationByClientIdSchemaType,
  GetAccessTokenSchemaType,
  RotateSecretParamsSchemaType,
  UpdateApplicationSchemaType,
  GeneratTokenSchemaType,
  RevokeTokenSchemaType,
  IntrospectTokenSchemaType,
  ConsentSchemaType,
  GetApplicationByIdSchemaType,
  AuthorizeSchemaType,
};
