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
} from "./oidc.controller";
import { getUserProfile } from "../auth/auth.controller";
import {
  adminOnly,
  restrictToAuthenticatedUser,
} from "../auth/auth.middleware";
import { validate } from "../../common/zod/zod.midleware";
import {
  consentSchema,
  deleteClientApplicationByClientIdSchema,
  getAccessTokenSchema,
  introspectTokenSchema,
  registerNewClientDataSchema,
  revokeTokenSchema,
} from "./oidc.schema";

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
  adminOnly(),
  validate(registerNewClientDataSchema),
  registerClient,
);

router.get("/applications", restrictToAuthenticatedUser(), getAllApplications);

router.delete(
  "/delete-client/:id",
  restrictToAuthenticatedUser(),
  validate(deleteClientApplicationByClientIdSchema, "params"),
  // TODO: Change this to superAdmin only
  adminOnly(),
  deleteClient,
);

router.get("/token", restrictToAuthenticatedUser(), getTokenInfo);
// router.post("/rotate-secret");
router.post("/consent", validate(consentSchema), consent);
router.post("/revoke", validate(revokeTokenSchema), revokeToken);
router.post("/introspect", validate(introspectTokenSchema), introspectToken);

export default router;
