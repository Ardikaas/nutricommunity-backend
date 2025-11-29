const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT;
const db = process.env.MONGODB_URI;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

mongoose
  .connect(db)
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log("Database error:", err));

app.get("/", async (req, res) => {
  res.send("hai ngapain kesini?");
});

app.listen(port, () => {
  console.log(`app listening on port http://localhost:${port}`);
});
