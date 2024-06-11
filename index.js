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
  limit: 20, // Limit each IP to 20 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});
app.use(limiter);
app.set("trust proxy", Number(process.env.PROXY_NUMBER)); // For Railway proxy
app.use(json());
app.use(express.static("public"));

app.get("/feedback", async (req, res) => {
  res.status(200).send({ message: "Gracias por tu opinión" });
  const { template, email, value } = req.query;
  const availableTemplates = ["time-improve", "aborded-improve", "invalid"];
  const templateIsValid = availableTemplates.includes(template);
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  const emailIsValid = emailRegex.test(email) || email === "null";
  const bitValue = value === "0" ? 0 : value === "1" ? 1 : -1;
  const valueIsValid = value !== -1;
  if (templateIsValid && emailIsValid && valueIsValid) {
    await client.query(
      "INSERT INTO feedback(template, email, value) VALUES($1, $2, $3)",
      [template, email, bitValue]
    );
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
