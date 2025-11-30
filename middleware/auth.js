const jwt = require("jsonwebtoken");
const User = require("../model/userModel");

const protect = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({
      status: {
        code: 401,
        message: "authorization token required",
      },
    });
  }

  const token = authorization.split(" ")[1];
  try {
    const { id } = jwt.verify(token, process.env.TOKENPASS);
    req.user = await User.findById(id).select("_id username");
    next();
  } catch (error) {
    res.status(401).json({
      status: {
        code: 401,
        message: "request is not authorized",
      },
    });
  }
};

module.exports = protect;
