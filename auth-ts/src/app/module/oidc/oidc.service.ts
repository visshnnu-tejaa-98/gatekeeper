import { USER } from "../../common/constants";
import { BadRequestError, NotFoundError } from "../../common/utils/api-error";
import {
  hashToken,
  generateRandomString,
  AccessTokenClaims,
  generateAccessToken,
  generateRefeshToken,
  verifyAccessToken,
  verifyConsentToken,
} from "../../common/utils/jwt";
import { env } from "../../common/zod/env";
import {
  addNewShortCode,
  getUserDetailsByUserId,
  revokeRefreshTokenByHash,
  updateUserWithRefreshToken,
} from "../auth/auth.utils";
import {
  IntrospectTokenProps,
  RegisterClientProps,
  RevokeTokenProps,
  TokenTypeHint,
} from "./oidc.types";
import {
  createNewApplication,
  deleteClientById,
  getApplicationByClientId,
  getApplicationDetails,
  getApplicationDetailsByUserIdAndApplicationUrl,
  insertRevokedToken,
  isTokenRevoked,
  verifyClientCredentials,
  verifyClientSecretAndShortCode,
  rotateApplicationSecretByApplicationId,
  updateApplicationById,
  getApplicationById,
  addNewAuthorizationCode,
  getAuthorizationCode,
  markAuthCodeUsed,
} from "./oidc.utils";

const registerNewClient = async (props: RegisterClientProps) => {
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

const getAllClientApplications = async (userId: string, role: string) => {
  const applications = await getApplicationDetails(userId, role);
  return applications;
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

  const claims: AccessTokenClaims = {
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

const rotateApplicationSecret = async (
  applicationId: string,
  userId: string,
  role: string,
) => {
  const clientSecret = generateRandomString(32);
  const hashedClientSecret = hashToken(clientSecret);
  const result = await rotateApplicationSecretByApplicationId({
    applicationId,
    userId,
    role,
    hashedClientSecret,
  });
  return { ...result, clientSecret };
};

const validateAuthorizeRequest = async (clientId: string) => {
  return await getApplicationByClientId(clientId);
};

const getClientApplicationById = async (
  applicationId: string,
  userId: string,
  role: string,
) => {
  return await getApplicationById(applicationId, userId, role);
};

const updateClientApplication = async (
  applicationId: string,
  userId: string,
  role: string,
  data: { name?: string; redirectUri?: string },
) => {
  return await updateApplicationById({ applicationId, userId, role, data });
};

const revokeClientToken = async (props: RevokeTokenProps) => {
  const {
    token,
    token_type_hint: tokenTypeHint,
    client_id: clientId,
    client_secret: rawClientSecret,
  } = props;
  await verifyClientCredentials(clientId, rawClientSecret);
  if (tokenTypeHint === TokenTypeHint.ACCESS_TOKEN) {
    const decoded = verifyAccessToken(token);
    if (decoded.jti && decoded.exp !== undefined) {
      await insertRevokedToken(decoded.jti, new Date(decoded.exp * 1000));
    }
  } else {
    // default: treat as refresh token, fall back to access token
    const revoked = await revokeRefreshTokenByHash(hashToken(token));
    if (!revoked) {
      const decoded = verifyAccessToken(token);
      if (decoded.jti && decoded.exp !== undefined) {
        await insertRevokedToken(decoded.jti, new Date(decoded.exp * 1000));
      }
    }
  }
};

const introspectClientToken = async (props: IntrospectTokenProps) => {
  const { token, client_id: clientId, client_secret: rawClientSecret } = props;
  await verifyClientCredentials(clientId, rawClientSecret);
  try {
    const decoded = verifyAccessToken(token);

    if (decoded.jti && (await isTokenRevoked(decoded.jti))) {
      return { active: false };
    }

    await getUserDetailsByUserId(decoded.sub);

    return {
      active: true,
      sub: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      role: decoded.role,
      iss: decoded.iss,
      exp: decoded.exp,
      iat: decoded.iat,
      ...(decoded.jti ? { jti: decoded.jti } : {}),
    };
  } catch {
    return { active: false };
  }
};

const processConsent = async (
  consentToken: string,
  clientId: string,
  code_challange?: string,
  algorithm?: string,
) => {
  const decoded = verifyConsentToken(consentToken);

  if (decoded.type !== "consent")
    throw new BadRequestError("Invalid token type");

  if (decoded.clientId !== clientId)
    throw new BadRequestError("Token does not match the provided client_id");

  const { redirectUri } = await getApplicationByClientId(clientId);

  const code =
    !code_challange ? generateRandomString(3) : generateRandomString(32);
  // PKCE Flow
  if (code_challange && algorithm) {
    await addNewAuthorizationCode({
      code,
      userId: decoded.sub,
      clientId,
      codeChallenge: code_challange,
      algorithm,
    });
  } else {
    // Normal flow
    await addNewShortCode({ code, userId: decoded.sub, clientId });
  }

  return { redirectUriWithShortcode: `${redirectUri}?code=${code}` };
};

const generateUserToken = async ({
  client_id,
  code,
  algorithm,
  code_verifier,
}: {
  client_id: string;
  code: string;
  algorithm: string;
  code_verifier: string;
}) => {
  const authCode = await getAuthorizationCode(code, client_id);

  if (authCode.used)
    throw new BadRequestError("Authorization code has already been used");

  if (authCode.expiresAt < new Date())
    throw new BadRequestError("Authorization code has expired");

  const hashedVerifier = hashToken(code_verifier);
  if (hashedVerifier !== authCode.codeChallenge)
    throw new BadRequestError("Invalid code_verifier");

  await markAuthCodeUsed(authCode.id);

  const userDetails = await getUserDetailsByUserId(authCode.userId);

  const claims: AccessTokenClaims = {
    iss: env.ISSUER_URL || "http://localhost:9000",
    sub: userDetails.id,
    email: userDetails.email,
    email_verified: userDetails.isEmailVerified ?? false,
    name: userDetails.name,
    picture: userDetails.avatar ?? "",
    role: userDetails.role,
  };

  const accessToken = generateAccessToken(claims);
  const refreshToken = generateRefeshToken({
    id: userDetails.id,
    role: userDetails.role,
  });
  const hashedRefreshToken = hashToken(refreshToken, algorithm);

  await updateUserWithRefreshToken(hashedRefreshToken, userDetails.email);

  return { accessToken, refreshToken };
};

export {
  registerNewClient,
  getAllClientApplications,
  deleteClientApplicationById,
  gestUserAccessToken,
  revokeClientToken,
  introspectClientToken,
  processConsent,
  rotateApplicationSecret,
  updateClientApplication,
  getClientApplicationById,
  validateAuthorizeRequest,
  generateUserToken,
};
