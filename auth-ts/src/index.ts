import "dotenv/config";
import { createServer } from "node:http";
import createExpressApp from "./app";

const main = () => {
  try {
    const server = createServer(createExpressApp());
    const PORT = process.env.PORT;
    const NODE_ENV = process.env.NODE_ENV;
    server.listen(9000, () => {
      console.log(`🚀 server is up and running ${PORT} in ${NODE_ENV} mode.`);
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

main();
