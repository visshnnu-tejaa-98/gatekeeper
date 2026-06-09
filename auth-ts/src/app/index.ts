import express from "express";
import ApiResponse from "./common/utils/api-response";
import { NotFoundError } from "./common/utils/api-error";
import { errorMiddleWare } from "./common/utils/error.middleware";
import AuthRouter from "./module/auth/auth.route";
import OidcRouter from "./module/oidc/oidc.route";
import { authenticate } from "./module/auth/auth.middleware";
import { getServiceDiscoveryEndpoints } from "./module/oidc/oidc.controller";

const createExpressApp = () => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(authenticate());

  app.get("/health", (req, res) => {
    return ApiResponse.success(res, "API is healthy");
  });

  app.use("/api/auth", AuthRouter);
  app.use("/o", OidcRouter);

  app.get("/.well-known/openid-configuration", getServiceDiscoveryEndpoints);

  app.use((req, res, next) => {
    next(new NotFoundError(`Route ${req.originalUrl} not found`));
  });

  app.use(errorMiddleWare);

  return app;
};

export default createExpressApp;
