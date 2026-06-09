import type { Request, Response } from "express";
import jose from "node-jose";

import { SERVICE_DISCOVERY_ENDPOINTS } from "./oidc.constants";
import { PUBLIC_KEY } from "../../common/utils/certs";
import { deleteClientApplicationById, registerNewClient } from "./oidc.service";
import ApiResponse from "../../common/utils/api-response";
import { NotFoundError } from "../../common/utils/api-error";
import { DeleteClientApplicationByClientIdSchemaType } from "./oidc.schema";

const getServiceDiscoveryEndpoints = (req: Request, res: Response) => {
  res.json(SERVICE_DISCOVERY_ENDPOINTS);
};

const getKeys = async (req: Request, res: Response) => {
  const keys = await jose.JWK.asKey(PUBLIC_KEY, "pem");
  res.json({ keys: [keys.toJSON()] });
};

const authorize = (req: Request, res: Response) => {
  res.redirect("http://localhost:3000/signup");
};

const registerClient = async (req: Request, res: Response) => {
  const { applicationDisplayName, applicationUrl, redirectUri } = req.body;
  const { sub } = req.user;

  if (!sub) throw new NotFoundError("User Not found");

  const application = await registerNewClient({
    applicationDisplayName,
    applicationUrl,
    redirectUri,
    userId: sub,
  });

  ApiResponse.created(res, "New Application got created", application);
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

export {
  getServiceDiscoveryEndpoints,
  getKeys,
  authorize,
  registerClient,
  deleteClient,
};
