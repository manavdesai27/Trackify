const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token = req.header("user-auth-token");
    if (!token)
      return res.status(401).json({
        msg: "No token, authorization denied",
      });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded)
      return res.status(401).json({
        msg: "Token is not valid",
      });
    req.user = decoded.userId;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
