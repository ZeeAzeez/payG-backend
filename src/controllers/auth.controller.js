const bcrypt = require("bcryptjs");
const User = require("../models/User");

const signup = async (req, res) => {
  try {
    const { email, username, phone, password } = req.body;

    if (!email || !username || !phone || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User with these details already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      username,
      phone,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Signup successful",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  signup,
};
