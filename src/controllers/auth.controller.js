const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // to Validate input
    if (!identifier || !password) {
      return res.status(400).json({
        message: "Identifier and password are required",
      });
    }

    // to find user by email OR phone OR username
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

    // to Compare password
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
