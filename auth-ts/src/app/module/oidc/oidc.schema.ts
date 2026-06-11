import { z } from "zod";
import { TOKEN_TYPES } from "../../common/constants";

const registerNewClientDataSchema = z.object({
  applicationDisplayName: z
    .string("Application Display Name should be string")
    .trim()
    .nonempty(),
  applicationUrl: z
    .string("Application URL should be string")
    .trim()
    .nonempty(),
  redirectUri: z.string("Redirect URI should be string").trim().nonempty(),
});

type RegisterNewClientDataSchemaType = z.infer<
  typeof registerNewClientDataSchema
>;

const deleteClientApplicationByClientIdSchema = z.object({
  id: z.string().trim().nonempty(),
});

type DeleteClientApplicationByClientIdSchemaType = z.infer<
  typeof deleteClientApplicationByClientIdSchema
>;

const getAccessTokenSchema = z.object({
  short_code: z.string().nonempty(),
  client_secret: z.string().nonempty(),
});

type GetAccessTokenSchemaType = z.infer<typeof getAccessTokenSchema>;

const clientCredentialsBaseSchema = z.object({
  token: z.string().trim().nonempty(),
  token_type_hint: z.enum(TOKEN_TYPES).optional(),
  client_id: z.string().nonempty(),
  client_secret: z.string().nonempty(),
});

const rotateSecretParamsSchema = z.object({
  id: z.string().trim().nonempty(),
});

type RotateSecretParamsSchemaType = z.infer<typeof rotateSecretParamsSchema>;

const consentSchema = z.object({
  consent_token: z.string().trim().nonempty(),
  client_id: z.string().nonempty(),
});

type ConsentSchemaType = z.infer<typeof consentSchema>;

const revokeTokenSchema = clientCredentialsBaseSchema;
type RevokeTokenSchemaType = z.infer<typeof revokeTokenSchema>;

const introspectTokenSchema = clientCredentialsBaseSchema;
type IntrospectTokenSchemaType = z.infer<typeof introspectTokenSchema>;

export {
  registerNewClientDataSchema,
  deleteClientApplicationByClientIdSchema,
  getAccessTokenSchema,
  rotateSecretParamsSchema,
  revokeTokenSchema,
  introspectTokenSchema,
  consentSchema,
};
export type {
  RegisterNewClientDataSchemaType,
  DeleteClientApplicationByClientIdSchemaType,
  GetAccessTokenSchemaType,
  RotateSecretParamsSchemaType,
  RevokeTokenSchemaType,
  IntrospectTokenSchemaType,
  ConsentSchemaType,
};
