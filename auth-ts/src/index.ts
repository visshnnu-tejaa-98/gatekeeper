import "dotenv/config";
import { createServer } from "node:http";
import createExpressApp from "./app";
import { cleanExpiredAuthCodes } from "./app/module/oidc/oidc.utils";

const main = async () => {
  try {
    await cleanExpiredAuthCodes();

    const server = createServer(createExpressApp());
    const PORT = Number(process.env.PORT) || 9000;
    const NODE_ENV = process.env.NODE_ENV;
    server.listen(PORT, () => {
      console.log(`🚀 server is up and running ${PORT} in ${NODE_ENV} mode.`);
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

main();
