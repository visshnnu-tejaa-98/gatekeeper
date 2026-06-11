import { z } from "zod";
import { ALLOWED_ROLES } from "../../common/constants";

const listUsersSchema = z.object({});

const userParamsSchema = z.object({
  params: z.object({
    id: z.string().trim().nonempty(),
  }),
});

const updateUserSchema = z.object({
  params: z.object({
    id: z.string().trim().nonempty(),
  }),
  body: z
    .object({
      name: z.string().trim().min(2).max(50),
      email: z.string().email().lowercase(),
      role: z.enum(ALLOWED_ROLES),
    })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),
});

type UserParamsSchemaType = z.infer<typeof userParamsSchema>;
type UpdateUserSchemaType = z.infer<typeof updateUserSchema>;

export { listUsersSchema, userParamsSchema, updateUserSchema };
export type { UserParamsSchemaType, UpdateUserSchemaType };
