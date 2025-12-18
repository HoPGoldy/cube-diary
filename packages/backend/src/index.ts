import { buildApp } from "@/app/build-app";
import { ENV_BACKEND_PORT } from "@/config/env";

const runApp = async () => {
  const app = await buildApp();
  await app.listen({ port: ENV_BACKEND_PORT, host: "0.0.0.0" });
};

runApp();
