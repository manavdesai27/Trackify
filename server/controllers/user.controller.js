const User = require("../models/Users");
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
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 36000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
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
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: 36000,
    });

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

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate("addedUrls");
    if (!user) {
      return res.status(400).json({ msg: "User does not exist" });
    }
    return res.status(200).json({
      success: true,
      data: {
        user: {
          userId: user.id,
          name: user.name,
          email: user.email,
          addedUrls: user.addedUrls,
        },
      },
    });
  } catch {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
