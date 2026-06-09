import { RegisterInputType, registerSchema } from "./auth.schema";
import { ValidationError } from "../../common/utils/api-error";

const validateRegisterInputData = async (payload: RegisterInputType) => {
  const { success, error, data } = await registerSchema.safeParseAsync(payload);
  if (!success) {
    throw new ValidationError(error.flatten().fieldErrors);
  }
  return data;
};

export { validateRegisterInputData };
