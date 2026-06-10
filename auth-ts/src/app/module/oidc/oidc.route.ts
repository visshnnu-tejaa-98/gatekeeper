import express from "express";
import {
  authorize,
  deleteClient,
  getAccessToken,
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

router.delete(
  "/delete-client/:id",
  restrictToAuthenticatedUser(),
  validate(deleteClientApplicationByClientIdSchema, "params"),
  // TODO: Change this to superAdmin only
  adminOnly(),
  deleteClient,
);
router.get("/token", restrictToAuthenticatedUser(), getTokenInfo);

router.post("/revoke", validate(revokeTokenSchema), revokeToken);
router.post("/introspect", validate(introspectTokenSchema), introspectToken);

export default router;
