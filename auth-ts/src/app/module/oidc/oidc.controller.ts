import type { Request, Response } from "express";
import jose from "node-jose";

import { SERVICE_DISCOVERY_ENDPOINTS } from "./oidc.constants";
import { PUBLIC_KEY } from "../../common/utils/certs";
import {
  deleteClientApplicationById,
  gestUserAccessToken,
  getAllClientApplications,
  introspectClientToken,
  processConsent,
  registerNewClient,
  revokeClientToken,
  rotateApplicationSecret,
  updateClientApplication,
  getClientApplicationById,
} from "./oidc.service";
import ApiResponse from "../../common/utils/api-response";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../common/utils/api-error";
import { DeleteClientApplicationByClientIdSchemaType } from "./oidc.schema";
import { env } from "../../common/zod/env";
import { ADMIN, USER } from "../../common/constants";

const getServiceDiscoveryEndpoints = (req: Request, res: Response) => {
  res.json(SERVICE_DISCOVERY_ENDPOINTS);
};

const getKeys = async (req: Request, res: Response) => {
  const keys = await jose.JWK.asKey(PUBLIC_KEY, "pem");
  res.json({ keys: [keys.toJSON()] });
};

const authorize = (req: Request, res: Response) => {
  res.redirect(env.CLIENT_URL);
};

const registerClient = async (req: Request, res: Response) => {
  const { applicationDisplayName, applicationUrl, redirectUri } = req.body;
  const { sub, email_verified } = req.user;

  if (!sub) throw new NotFoundError("User Not found");
  if (!email_verified)
    throw new BadRequestError(
      "Please verify your email to register a new client",
    );

  const application = await registerNewClient({
    applicationDisplayName,
    applicationUrl,
    redirectUri,
    userId: sub,
  });

  ApiResponse.created(res, "New Application got created", application);
};

const getAllApplications = async (req: Request, res: Response) => {
  const { sub, role } = req.user;
  if (!sub) throw new NotFoundError("User Not found");
  if (role === USER || role === undefined)
    throw new UnauthorizedError("Unauthorised to access the applications");

  const applications = await getAllClientApplications(sub, role);
  ApiResponse.success(
    res,
    "User applications fetched successfully",
    applications,
  );
};

const deleteClient = async (
  req: Request<DeleteClientApplicationByClientIdSchemaType>,
  res: Response,
) => {
  const { id: applicationId } = req.params;
  await deleteClientApplicationById(applicationId);
  ApiResponse.success(
    res,
    `Application with id ${applicationId} is deleted successfully`,
  );
};

const getAccessToken = async (req: Request, res: Response) => {
  const { short_code: shortCode, client_secret: clientSecret } = req.query;
  if (typeof shortCode !== "string" || typeof clientSecret !== "string") {
    return new BadRequestError("Missing or invalid query parameters.");
  }
  const data = await gestUserAccessToken(clientSecret, shortCode);

  ApiResponse.success(res, "Access Token generated successfully", data);
};

const getTokenInfo = async (req: Request, res: Response) => {
  ApiResponse.success(res, "User details fetched Successfully", req.user);
};

const consent = async (req: Request, res: Response) => {
  const { consent_token, client_id } = req.body;
  const result = await processConsent(consent_token, client_id);
  ApiResponse.success(res, "Consent granted", result);
};

const rotateSecret = async (req: Request, res: Response) => {
  const { sub: userId, role } = req.user;
  const applicationId = req.params.id as string;
  if (!userId) throw new UnauthorizedError("Invalid session");
  const result = await rotateApplicationSecret(applicationId, userId, role);
  ApiResponse.success(res, "Secret rotated successfully", result);
};

const getApplication = async (req: Request, res: Response) => {
  const { sub: userId, role } = req.user;
  const applicationId = req.params.id as string;
  if (!userId) throw new UnauthorizedError("Invalid session");
  const result = await getClientApplicationById(applicationId, userId, role);
  ApiResponse.success(res, "Application fetched successfully", result);
};

const updateApplication = async (req: Request, res: Response) => {
  const { sub: userId, role } = req.user;
  const applicationId = req.params.id as string;
  if (!userId) throw new UnauthorizedError("Invalid session");
  const { name, redirectUri } = req.body;
  const result = await updateClientApplication(applicationId, userId, role, {
    ...(name !== undefined ? { name } : {}),
    ...(redirectUri !== undefined ? { redirectUri } : {}),
  });
  ApiResponse.success(res, "Application updated successfully", result);
};

const revokeToken = async (req: Request, res: Response) => {
  const { token, token_type_hint, client_id, client_secret } = req.body;
  await revokeClientToken({ token, client_id, client_secret, token_type_hint });
  ApiResponse.success(res, "Token revoked successfully");
};

const introspectToken = async (req: Request, res: Response) => {
  const { token, client_id, client_secret } = req.body;
  const result = await introspectClientToken({
    token,
    client_id,
    client_secret,
  });
  ApiResponse.success(res, "Token introspected successfully", result);
};

export {
  getServiceDiscoveryEndpoints,
  getKeys,
  authorize,
  registerClient,
  getAllApplications,
  getApplication,
  deleteClient,
  getAccessToken,
  getTokenInfo,
  revokeToken,
  introspectToken,
  consent,
  rotateSecret,
  updateApplication,
};
