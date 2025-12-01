const fs = require("fs");
const path = require("path");
const Article = require("../model/articleModel");

const ArticleController = {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
};

async function createArticle(req, res) {
  try {
    const { title, first, second, third } = req.body;
    let image = "image.jpg";

    const newArticle = new Article({
      title,
      first,
      second,
      third,
      image,
    });

    const saved = await newArticle.save();

    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const newFilename = `${saved._id}${ext}`;

      const oldPath = req.file.path;
      const newPath = path.join(__dirname, "../images/articles", newFilename);

      fs.renameSync(oldPath, newPath);

      saved.image = newFilename;
      await saved.save();
    }

    res.status(201).json({
      status: {
        code: 201,
        message: "Article created successfully",
      },
      data: saved,
    });
  } catch (error) {
    res.status(500).json({
      status: { code: 500, message: error.message },
    });
  }
}

async function getArticles(req, res) {
  try {
    const articles = await Article.find().sort({ created_at: -1 });

    res.status(200).json({
      status: {
        code: 200,
        message: "Articles fetched successfully",
      },
      data: articles,
    });
  } catch (error) {
    res.status(500).json({
      status: {
        code: 500,
        message: error.message,
      },
    });
  }
}

async function getArticleById(req, res) {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({
        status: {
          code: 404,
          message: "Article not found",
        },
      });
    }

    res.status(200).json({
      status: {
        code: 200,
        message: "Article fetched successfully",
      },
      data: article,
    });
  } catch (error) {
    res.status(500).json({
      status: {
        code: 500,
        message: error.message,
      },
    });
  }
}

async function updateArticle(req, res) {
  try {
    const { id } = req.params;

    const existing = await Article.findById(id);
    if (!existing) {
      return res.status(404).json({
        status: {
          code: 404,
          message: "Article not found",
        },
      });
    }

    existing.title = req.body.title ?? existing.title;
    existing.first = req.body.first ?? existing.first;
    existing.second = req.body.second ?? existing.second;
    existing.third = req.body.third ?? existing.third;

    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const newFilename = `${existing._id}${ext}`;

      const oldPath = req.file.path;
      const newPath = path.join(__dirname, "../images/articles", newFilename);

      if (existing.image !== "image.jpg") {
        const oldImg = path.join(
          __dirname,
          "../images/articles",
          existing.image
        );
        if (fs.existsSync(oldImg)) fs.unlinkSync(oldImg);
      }

      fs.renameSync(oldPath, newPath);

      existing.image = newFilename;
    }

    const updated = await existing.save();

    res.status(200).json({
      status: {
        code: 200,
        message: "Article updated successfully",
      },
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      status: {
        code: 500,
        message: error.message,
      },
    });
  }
}

async function deleteArticle(req, res) {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({
        status: {
          code: 404,
          message: "Article not found",
        },
      });
    }

    if (article.image !== "image.jpg") {
      const filePath = path.join(
        __dirname,
        "../images/articles",
        article.image
      );
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Article.findByIdAndDelete(id);

    res.status(200).json({
      status: {
        code: 200,
        message: "Article deleted successfully",
      },
    });
  } catch (error) {
    res.status(500).json({
      status: {
        code: 500,
        message: error.message,
      },
    });
  }
}

module.exports = ArticleController;
