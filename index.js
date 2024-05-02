import "dotenv/config";
import pg from "pg";
import express, { json } from "express";
import { rateLimit } from "express-rate-limit";
const { Client } = pg;

// Set server timezone to UTC
process.env.TZ = "UTC";

// DB
const client = new Client({
  connectionString: process.env.PG_CONNECTION_STRING,
});
client.connect();

// API
const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});
app.use(limiter);
app.set("trust proxy", Number(process.env.PROXY_NUMBER)); // For Railway proxy
app.use(json());

app.get("/", (req, res) => {
  return res.status(200).send({ msg: "Hola mundo" });
});

app.get("/feedback", async (req, res) => {
  const { template, email, value } = req.query;
  const availableTemplates = ["time-improve", "aborded-improve"];
  const templateIsValid = availableTemplates.includes(template);
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  const emailIsValid = emailRegex.test(email);
  const valueIsValid = ["true", "false"].includes(value.toLowerCase());
  const bitValue = value.toLowerCase() === "true" ? 1 : 0;
  res.status(200).send("<h1>Gracias por tu opinión</h1><br /><h3>Puedes cerrar esta pestaña</h3>");
  if (templateIsValid && emailIsValid && valueIsValid) {
    await client.query("INSERT INTO feedback(template, email, value) VALUES($1, $2, $3)", [
      template,
      email,
      bitValue,
    ]);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(
    `Server is running ${
      process.env.NODE_ENV === "development"
        ? `at http://localhost:${port}`
        : ""
    }`
  );
});
