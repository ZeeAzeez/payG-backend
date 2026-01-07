const Wallet = require("../models/Wallet");

const getWalletBalance = async (req, res) => {
  try {
    const userId = req.user._id;

    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      return res.status(404).json({
        message: "No Wallet found",
      });
    }

    return res.status(200).json({
      balance: wallet.balance,
      currency: wallet.currency,
    });
  } catch (error) {
    console.error("Get the wallet balance error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }

  module.exports = {
    getWalletBalance,
  };
};
