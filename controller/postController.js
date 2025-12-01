const fs = require("fs");
const path = require("path");
const Post = require("../model/postModel");

const PostController = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  addComment,
  likePost,
  sharePost,
};

async function createPost(req, res) {
  try {
    const { description } = req.body;
    const image = req.file ? req.file.filename : "default_post.jpg";
    const userId = req.user._id;

    const newPost = new Post({ user: userId, description, image });
    const post = await newPost.save();

    res.status(201).json({
      status: {
        code: 201,
        message: "Post created successfully",
      },
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      status: { code: 500, message: error.message },
    });
  }
}

async function getAllPosts(req, res) {
  try {
    const posts = await Post.find()
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });
    res.status(200).json({
      status: {
        code: 200,
        message: "Posts fetched successfully",
      },
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      status: { code: 500, message: error.message },
    });
  }
}

async function getPostById(req, res) {
  try {
    const { id } = req.params;
    const post = await Post.findById(id).populate("user", "username avatar");
    if (!post)
      return res.status(404).json({
        status: { code: 404, message: "Post not found" },
      });

    res.status(200).json({
      status: { code: 200, message: "Success" },
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      status: { code: 500, message: error.message },
    });
  }
}

async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post)
      return res.status(404).json({
        status: { code: 404, message: "Post not found" },
      });

    if (req.user._id.toString() !== post.user.toString()) {
      return res.status(403).json({
        status: { code: 403, message: "Not authorized" },
      });
    }

    if (req.body.description) post.description = req.body.description;

    if (req.file) {
      if (post.image !== "default_post.jpg") {
        const filePath = path.join(__dirname, "../images/posts", post.image);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      post.image = req.file.filename;
    }

    const updated = await post.save();
    res.status(200).json({
      status: {
        code: 200,
        message: "Post updated",
      },
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      status: { code: 500, message: error.message },
    });
  }
}

async function deletePost(req, res) {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post)
      return res.status(404).json({
        status: {
          code: 404,
          message: "Post not found",
        },
      });

    if (req.user._id.toString() !== post.user.toString()) {
      return res.status(403).json({
        status: {
          code: 403,
          message: "Not authorized",
        },
      });
    }

    if (post.image !== "default_post.jpg") {
      const filePath = path.join(__dirname, "../images/posts", post.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Post.findByIdAndDelete(id);
    res.status(200).json({
      status: { code: 200, message: "Post deleted" },
    });
  } catch (error) {
    res.status(500).json({
      status: { code: 500, message: error.message },
    });
  }
}

async function addComment(req, res) {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const post = await Post.findById(id);
    if (!post)
      return res.status(404).json({
        status: {
          code: 404,
          message: "Post not found",
        },
      });

    post.comments.push({ user: req.user._id, text });
    await post.save();
    res.status(200).json({
      status: {
        code: 200,
        message: "Comment added",
      },
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      status: { code: 500, message: error.message },
    });
  }
}

async function likePost(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const post = await Post.findById(id);
    if (!post)
      return res.status(404).json({
        status: {
          code: 404,
          message: "Post not found",
        },
      });

    const index = post.likes.findIndex(
      (u) => u.toString() === userId.toString()
    );
    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.status(200).json({
      status: {
        code: 200,
        message: "Post liked/unliked",
      },
      data: post,
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

async function sharePost(req, res) {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post)
      return res.status(404).json({
        status: {
          code: 404,
          message: "Post not found",
        },
      });

    post.shares += 1;
    await post.save();
    res.status(200).json({
      status: {
        code: 200,
        message: "Post shared",
      },
      data: post,
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

module.exports = PostController;
