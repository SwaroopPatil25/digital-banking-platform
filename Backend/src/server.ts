import { env } from "./config/env.js";
import app from "./app.js";
import connectDB from "./config/db.js";

const startServer = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    console.log(`   API: ${env.API_BASE_URL}`);
    console.log(`   Client: ${env.CLIENT_URL}`);
  });
};

startServer();
