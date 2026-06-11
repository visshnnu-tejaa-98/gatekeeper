import { ALLOWED_ROLES } from "../../common/constants";

type AllowedRole = (typeof ALLOWED_ROLES)[number];

export type UpdateUserByIdProps = {
  targetUserId: string;
  requesterId: string;
  requesterRole: string;
  data: {
    name?: string;
    email?: string;
    role?: AllowedRole;
  };
};
