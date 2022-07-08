const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    const payload = {
      user: {
        userId: newUser.id,
      },
    };
    jwt.sign(payload, process.env.JWT_SECRET, {}, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate("addedUrls");
    if (!user) {
      return res.status(400).json({ msg: "User does not exist" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    const payload = {
      user: {
        userId: user.id,
      },
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {});

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          userId: user.id,
          name: user.name,
          email: user.email,
          addedUrls: user.addedUrls,
        },
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user).populate("addedUrls");
    res.json({
      userId: user.id,
      displayName: user.name,
      email: user.email,
      addedUrls: user.addedUrls,
    }); 
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.validateToken = async (req, res, next) => {
  try {
    const token = req.header("user-auth-token");
    if (!token) return res.json(false);

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) return res.json(false);

    const user = await User.findById(verified.user.userId);
    if (!user) return res.json(false);

    return res.json(true);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
