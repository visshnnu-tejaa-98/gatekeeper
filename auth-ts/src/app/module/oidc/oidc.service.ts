import { USER } from "../../common/constants";
import { BadRequestError, NotFoundError } from "../../common/utils/api-error";
import {
  hashToken,
  generateRandomString,
  AccessTokenPayload,
  generateAccessToken,
  generateRefeshToken,
} from "../../common/utils/jwt";
import { env } from "../../common/zod/env";
import {
  getUserDetailsByUserId,
  updateUserWithRefreshToken,
} from "../auth/auth.utils";
import { registerClientProps } from "./oidc.types";
import {
  createNewApplication,
  deleteClientById,
  getApplicationDetailsByUserIdAndApplicationUrl,
  verifyClientSecretAndShortCode,
} from "./oidc.utils";

const registerNewClient = async (props: registerClientProps) => {
  const { applicationDisplayName, applicationUrl, redirectUri, userId } = props;

  const application = await getApplicationDetailsByUserIdAndApplicationUrl(
    userId,
    applicationUrl,
  );

  if (application)
    throw new BadRequestError(
      "Application already Exists, Check with a different URL",
    );

  const clientId = generateRandomString(16);
  const clientSecret = generateRandomString(32);
  const hashedClientSecret = hashToken(clientSecret);

  const applicationData = {
    applicationDisplayName,
    applicationUrl,
    redirectUri,
    userId,
    clientId,
    clientSecret: hashedClientSecret,
  };

  const createdApplication = await createNewApplication(applicationData);
  return { ...createdApplication[0], clientSecret: clientSecret };
};

const deleteClientApplicationById = async (applicationId: string) => {
  const deletedItem = await deleteClientById(applicationId);
  return deletedItem;
};

const gestUserAccessToken = async (clientSecret: string, shortCode: string) => {
  const hashedClientSecret = hashToken(clientSecret);
  const { userId } = await verifyClientSecretAndShortCode(
    shortCode,
    hashedClientSecret,
  );

  const userDetails = await getUserDetailsByUserId(userId);

  const claims: AccessTokenPayload = {
    iss: env.ISSUER_URL || "http://localhost:9000",
    sub: userDetails.id.toString(),
    email: userDetails.email,
    email_verified: userDetails.isEmailVerified ?? false,
    name: userDetails.name,
    picture: userDetails.avatar ?? "",
    role: userDetails.role,
  };

  const accessToken = generateAccessToken(claims);
  const refreshToken = generateRefeshToken({
    id: userDetails?.id!,
    role: USER,
  });
  const hashedRefreshToken = hashToken(refreshToken);

  const updatedUser = await updateUserWithRefreshToken(
    hashedRefreshToken,
    userDetails.email,
  );

  return {
    id: updatedUser.id,
    accessToken,
  };
};

export { registerNewClient, deleteClientApplicationById, gestUserAccessToken };
