const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));

app.get("/api/health", (_, res) =>
  res.json({ ok: true, service: "bugcit-api" })
);

app.listen(process.env.PORT || 4000, () => {
  console.log("API listening on", process.env.PORT || 4000);
});
