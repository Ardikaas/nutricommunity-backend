const User = require("../model/userModel.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.TOKENPASS, { expiresIn: "30d" });
};

const UserController = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  logoutUser,
  userProfile,
  getUserRank,
  getUserRankById,
  addQuestCompletion,
  getUserCompletedQuest,
};

async function getAllUsers(req, res) {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      status: {
        code: 200,
        message: "Success",
      },
      data: users,
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

async function getUserById(req, res) {
  try {
    const user = await User.findById(req.params.id).select("-password");
    res.status(200).json({
      status: {
        code: 200,
        message: "Success",
      },
      data: user,
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

async function createUser(req, res) {
  try {
    const { username, password, email, avatar, role } = req.body;

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({
        status: {
          code: 400,
          message: "Username already exists",
        },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      avatar,
      role,
    });

    const user = await newUser.save();

    res.status(201).json({
      status: {
        code: 201,
        message: "User created successfully",
      },
      data: user,
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

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { username, email, avatar, role, password } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: {
          code: 404,
          message: "User not found",
        },
      });
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          status: {
            code: 400,
            message: "Username already exists",
          },
        });
      }
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;
    if (role) user.role = role;
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      user.password = hashed;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      status: {
        code: 200,
        message: "User updated successfully",
      },
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
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

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    res.status(200).json({
      status: {
        code: 200,
        message: "User deleted successfully",
      },
      data: user,
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

async function loginUser(req, res) {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        status: {
          code: 404,
          message: "User not found",
        },
      });
    }
    const passValidation = await bcrypt.compare(password, user.password);

    if (!passValidation) {
      return res.status(404).json({
        status: {
          code: 404,
          message: "Invalid password",
        },
      });
    }
    const token = createToken(user._id);
    res.status(200).json({
      status: {
        code: 200,
        message: "Login Success",
      },
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        password: user.password,
      },
      token,
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

async function logoutUser(req, res) {
  const token = req.user.token;
  const newToken = token.filter((t) => t.token !== token);
  await User.findByIdAndUpdate(req.user._id, { token: newToken });
  res.status(200).json({
    status: {
      code: 200,
      message: "Logout Success",
    },
  });
}

async function userProfile(req, res) {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({
        status: { code: 404, message: "User not found" },
      });
    }

    const level = Math.floor(Math.sqrt(user.exp / 100)) + 1;
    const expCurrentLevel = Math.pow(level - 1, 2) * 100;
    const expNextLevel = Math.pow(level, 2) * 100;
    const expToNext = expNextLevel - user.exp;

    const progress = Math.floor(
      ((user.exp - expCurrentLevel) / (expNextLevel - expCurrentLevel)) * 10
    );
    const totalBadge = user.badge.length;
    const totalQuest = user.quest.length;
    const streak = user.streak ? user.streak.current_streak : 0;

    res.status(200).json({
      status: { code: 200, message: "Profile fetched successfully" },
      data: {
        username: user.username,
        level,
        exp: user.exp,
        expToNext,
        progress,
        streak,
        totalBadge,
        totalQuest,
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

async function getUserRank(req, res) {
  try {
    const users = await User.find().select("username exp avatar");

    const rankedUsers = users
      .sort((a, b) => b.exp - a.exp)
      .map((user, index) => ({
        rank: index + 1,
        username: user.username,
        exp: user.exp,
        avatar: user.avatar,
      }));

    res.status(200).json({
      status: {
        code: 200,
        message: "User ranking fetched successfully",
      },
      data: rankedUsers,
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

async function getUserRankById(req, res) {
  try {
    const { id } = req.params;

    const users = await User.find()
      .select("username exp avatar")
      .sort({ exp: -1 });

    const ranked = users.map((u, index) => ({
      id: u._id,
      username: u.username,
      exp: u.exp,
      avatar: u.avatar,
      rank: index + 1,
    }));

    const userRank = ranked.find((u) => u.id.toString() === id);

    if (!userRank) {
      return res.status(404).json({
        status: {
          code: 404,
          message: "User not found",
        },
      });
    }

    res.status(200).json({
      status: {
        code: 200,
        message: "User rank fetched successfully",
      },
      data: userRank,
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

async function addQuestCompletion(req, res) {
  try {
    const userId = req.user._id;
    const { quest_id, exp_earned, completed_at } = req.body;

    if (!quest_id || !exp_earned || !completed_at) {
      return res.status(400).json({
        status: {
          code: 400,
          message: "All fields are required",
        },
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: {
          code: 404,
          message: "User not found",
        },
      });
    }

    user.quest.push({
      quest_id,
      exp_earned,
      completed_at,
    });

    user.exp += exp_earned;

    await user.save();

    res.status(201).json({
      status: { code: 201, message: "Quest completed successfully" },
      data: {
        quest_id,
        exp_earned,
        completed_at,
        total_exp: user.exp,
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

async function getUserCompletedQuest(req, res) {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("quest username");
    if (!user) {
      return res.status(404).json({
        status: {
          code: 404,
          message: "User not found",
        },
      });
    }

    res.status(200).json({
      status: {
        code: 200,
        message: "Completed quest fetched successfully",
      },
      data: user.quest,
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

module.exports = UserController;
