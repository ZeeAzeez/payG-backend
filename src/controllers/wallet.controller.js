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

const User = require("../models/User");

const transferWallet = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { toUsername, amount, description } = req.body;

    if (!toUsername || !amount || amount <= 0 || !description) {
      return res.status(400).json({
        message: "toUsername, amount and description are required",
      });
    }

    // to find the sender's wallet
    const senderWallet = await Wallet.findOne({ user: senderId });

    if (!senderWallet) {
      return res.status(404).json({
        message: "Sender wallet not found",
      });
    }

    //to find receiver user
    const receiverUser = await User.findOne({
      username: toUsername.toLowerCase(),
    });

    if (!receiverUser) {
      return res.status(404).json({
        message: "Receiver not found",
      });
    }

    //to prevent self-transfer
    if (receiverUser._id.toString() === senderId.toString()) {
      return res.status(400).json({
        message: "You cannot transfer money to yourself",
      });
    }

    // to find receiver wallet
    const receiverWallet = await Wallet.findOne({
      user: receiverUser._id,
    });

    if (!receiverWallet) {
      return res.status(404).json({
        message: "Receiver wallet not found",
      });
    }

    // to check balance
    if (senderWallet.balance < amount) {
      return res.status(400).json({
        message: "Insufficient balance",
      });
    }

    // to update balances
    senderWallet.balance -= amount;
    receiverWallet.balance += amount;

    await senderWallet.save();
    await receiverWallet.save();

    // to record transactions
    await Transaction.create([
      {
        user: senderId,
        type: "debit",
        amount,
        description: `Transfer to ${toUsername}: ${description}`,
      },
      {
        user: receiverUser._id,
        type: "credit",
        amount,
        description: `Transfer from ${req.user.username}: ${description}`,
      },
    ]);

    return res.status(200).json({
      message: "Transfer successful",
      balance: senderWallet.balance,
    });
  } catch (error) {
    console.error("Transfer error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    // pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // added filtering
    const { type } = req.query;

    const filter = { user: userId };

    if (type === "credit" || type === "debit") {
      filter.type = type;
    }

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(filter);

    return res.status(200).json({
      page,
      limit,
      total,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Transaction history error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getWalletBalance,
  fundWallet,
  transferWallet,
  getTransactionHistory,
};
