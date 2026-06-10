import { z } from "zod";

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

export {
  registerNewClientDataSchema,
  deleteClientApplicationByClientIdSchema,
  getAccessTokenSchema,
};
export type {
  RegisterNewClientDataSchemaType,
  DeleteClientApplicationByClientIdSchemaType,
  GetAccessTokenSchemaType,
};
