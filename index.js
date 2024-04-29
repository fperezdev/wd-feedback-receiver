import dotenv from "dotenv";
import { Client } from "pg";
import express, { json } from "express";

// Set server timezone to UTC
process.env.TZ = "UTC";

// DB
export const client = new Client(DATABASE_URL);
client.connect();

// API
const app = express();
app.set("trust proxy", Number(process.env.PROXY_NUMBER)); // For Railway proxy
app.use(json());
app.use(router);
app.listen(PORT, () => {
  console.log(
    `Server is running ${
      process.env.NODE_ENV === "development"
        ? `at http://localhost:${PORT}`
        : ""
    }`
  );
});
