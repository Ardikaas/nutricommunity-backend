const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const UserController = require("./controller/userController");
require("dotenv").config();
const QuestController = require("./controller/questController");
const protect = require("./middleware/auth");

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

app.get("/user", async (req, res) => {
  UserController.getAllUsers(req, res);
});

app.get("/user/:id", async (req, res) => {
  UserController.getUserById(req, res);
});

app.post("/user/register", async (req, res) => {
  UserController.createUser(req, res);
});

app.post("/user/login", async (req, res) => {
  UserController.loginUser(req, res);
});

app.get("/user/logout", async (req, res) => {
  UserController.logoutUser(req, res);
});

app.get("/quest", (req, res) => {
  QuestController.getAllQuests(req, res);
});

app.get("/quest/:id", (req, res) => {
  QuestController.getQuestById(req, res);
});

app.post("/quest", (req, res) => {
  QuestController.createQuest(req, res);
});

app.put("/quest/:id", (req, res) => {
  QuestController.updateQuest(req, res);
});

app.delete("/quest/:id", (req, res) => {
  QuestController.deleteQuest(req, res);
});

app.listen(port, () => {
  console.log(`app listening on port http://localhost:${port}`);
});
