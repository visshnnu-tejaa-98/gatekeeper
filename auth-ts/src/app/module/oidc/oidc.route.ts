import express from "express";
import {
  authorize,
  consent,
  deleteClient,
  getAccessToken,
  getAllApplications,
  getKeys,
  getTokenInfo,
  introspectToken,
  registerClient,
  revokeToken,
  rotateSecret,
  updateApplication,
} from "./oidc.controller";
import { getUserProfile } from "../auth/auth.controller";
import {
  restrictTo,
  restrictToAuthenticatedUser,
} from "../auth/auth.middleware";
import { validate } from "../../common/zod/zod.midleware";
import {
  consentSchema,
  deleteClientApplicationByClientIdSchema,
  getAccessTokenSchema,
  introspectTokenSchema,
  registerNewClientDataSchema,
  rotateSecretParamsSchema,
  revokeTokenSchema,
  updateApplicationParamsSchema,
  updateApplicationBodySchema,
} from "./oidc.schema";
import { ADMIN, SUPER_ADMIN } from "../../common/constants";

const router = express.Router();

router.get("/jwks.json", getKeys);
router.get("/authorize", authorize);
router.get("/userInfo", getUserProfile);
router.get(
  "/access-token",
  validate(getAccessTokenSchema, "query"),
  getAccessToken,
);
router.post(
  "/register-client",
  restrictToAuthenticatedUser(),
  restrictTo(ADMIN),
  validate(registerNewClientDataSchema),
  registerClient,
);

router.get("/applications", restrictToAuthenticatedUser(), getAllApplications);

router.delete(
  "/delete-client/:id",
  restrictToAuthenticatedUser(),
  validate(deleteClientApplicationByClientIdSchema, "params"),
  // TODO Check delete functionality with multipe user roles
  restrictTo(SUPER_ADMIN),
  deleteClient,
);

router.get("/token", restrictToAuthenticatedUser(), getTokenInfo);
router.post("/consent", validate(consentSchema), consent);

router.post(
  "/rotate-secret/:id",
  restrictToAuthenticatedUser(),
  restrictTo(ADMIN, SUPER_ADMIN),
  validate(rotateSecretParamsSchema, "params"),
  rotateSecret,
);
router.patch(
  "/application/:id",
  restrictToAuthenticatedUser(),
  restrictTo(ADMIN, SUPER_ADMIN),
  validate(updateApplicationParamsSchema, "params"),
  validate(updateApplicationBodySchema),
  updateApplication,
);
router.post("/revoke", validate(revokeTokenSchema), revokeToken);
router.post("/introspect", validate(introspectTokenSchema), introspectToken);

export default router;
