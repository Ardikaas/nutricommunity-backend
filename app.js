const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const ArticleController = require("./controller/articleController");
const QuestController = require("./controller/questController");
const UserController = require("./controller/userController");
const PostController = require("./controller/postController");
const protect = require("./middleware/auth");

const app = express();
const port = process.env.PORT;
const db = process.env.MONGODB_URI;

function imageFallback(basePath, defaultFile) {
  return (req, res, next) => {
    const filePath = path.join(basePath, req.path);
    if (fs.existsSync(filePath)) {
      return next();
    }
    res.sendFile(path.join(basePath, defaultFile));
  };
}

app.use(
  "/images/avatars",
  imageFallback(path.join(__dirname, "images/avatars"), "default_avatar.png"),
  express.static(path.join(__dirname, "images/avatars"))
);
app.use(
  "/images/posts",
  imageFallback(path.join(__dirname, "images/posts"), "default_post.jpg"),
  express.static(path.join(__dirname, "images/posts"))
);
app.use(
  "/images/articles",
  imageFallback(path.join(__dirname, "images/articles"), "image.jpg"),
  express.static(path.join(__dirname, "images/articles"))
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

const articleStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images/articles");
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const postStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images/posts");
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const uploadArticle = multer({ storage: articleStorage });
const uploadPost = multer({ storage: postStorage });

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

app.get("/article", (req, res) => {
  ArticleController.getArticles(req, res);
});

app.get("/article/:id", (req, res) => {
  ArticleController.getArticleById(req, res);
});

app.post("/article", uploadArticle.single("image"), (req, res) => {
  ArticleController.createArticle(req, res);
});

app.put("/article/:id", uploadArticle.single("image"), (req, res) => {
  ArticleController.updateArticle(req, res);
});

app.delete("/article/:id", (req, res) => {
  ArticleController.deleteArticle(req, res);
});

app.get("/user_profile", protect, async (req, res) => {
  UserController.userProfile(req, res);
});

app.get("/post", (req, res) => {
  PostController.getAllPosts(req, res);
});

app.get("/post/:id", protect, (req, res) => {
  PostController.getPostById(req, res);
});

app.post("/post", protect, uploadPost.single("image"), (req, res) => {
  PostController.createPost(req, res);
});

app.put("/post/:id", protect, uploadPost.single("image"), (req, res) => {
  PostController.updatePost(req, res);
});

app.delete("/post/:id", (req, res) => {
  PostController.deletePost(req, res);
});

// LIKE & COMMENT
app.put("/post/:id/like", protect, (req, res) => {
  PostController.likePost(req, res);
});

app.post("/post/:id/comment", protect, (req, res) => {
  PostController.addComment(req, res);
});

app.listen(port, () => {
  console.log(`app listening on port http://localhost:${port}`);
});
