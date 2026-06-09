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

export { registerNewClientDataSchema, deleteClientApplicationByClientIdSchema };

export type {
  RegisterNewClientDataSchemaType,
  DeleteClientApplicationByClientIdSchemaType,
};
