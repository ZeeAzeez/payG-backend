const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Wallet = require("../models/Wallet");
const mongoose = require("mongoose");

const signup = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email, username, phone, password } = req.body;

    //email validation
    if (!email || !username || !phone || !password) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        message: "All fields are required",
      });
    }

    //checking is the user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }, { username }],
    });

    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        message: "User with these details already exists",
      });
    }

    // const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, 10);

    //creating the user
    const user = await User.create(
      [
        {
          email,
          username,
          phone,
          password: hashedPassword,
        },
      ],
      { session }
    );

    //creating the wallet inside the transaction
    await Wallet.create(
      [
        {
          user: user[0]._id,
          balance: 0,
          currency: "NGN",
        },
      ],
      { session }
    );

    //committing the transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Signup successful",
      user: {
        id: user[0]._id,
        email: user[0].email,
        username: user[0].username,
        phone: user[0].phone,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Signup error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // to Validate input
    if (!identifier || !password) {
      return res.status(400).json({
        message: "Identifier and password are required",
      });
    }

    // to Find user by email OR phone OR username
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { phone: identifier },
        { username: identifier.toLowerCase() },
      ],
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    //to Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // to Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // to Respond
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  signup,
  login,
};
