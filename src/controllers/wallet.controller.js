const Wallet = require("../models/Wallet");

const getWalletBalance = async (req, res) => {
  try {
    //the auth middleware sets the req.user
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
};

const Transaction = require("../models/Transaction");
const fundWallet = async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount, description } = req.body;

    if (!amount || amount <= 0 || !description) {
      return res.status(400).json({
        message: "Amount and description are required",
      });
    }

    // to find the wallet
    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      return res.status(404).json({
        message: "Wallet not found",
      });
    }

    //to Update the wallet balance
    wallet.balance += amount;
    await wallet.save();

    //to create a transaction record
    await Transaction.create({
      user: userId,
      type: "credit",
      amount,
      description,
    });

    //to Respond to the client
    return res.status(200).json({
      message: "Wallet funded successfully",
      balance: wallet.balance,
    });
  } catch (error) {
    console.error("Fund wallet error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getWalletBalance,
  fundWallet,
};
