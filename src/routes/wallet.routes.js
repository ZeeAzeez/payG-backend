const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const {
  getWalletBalance,
  fundWallet,
  transferWallet,
  getTransactionHistory,
  initiatePaystackFunding,
  verifyPaystackPayment,
} = require("../controllers/wallet.controller");

//this collects the wallet balance
router.get("/balance", authMiddleware, getWalletBalance);
//to fund the wallet
router.post("/fund", authMiddleware, fundWallet);
//for tranferring funds between wallets
router.post("/transfer", authMiddleware, transferWallet);
// for checking transaction history
router.get("/transactions", authMiddleware, getTransactionHistory);
//paystack initializatin
router.post("/fund/paystack", authMiddleware, initiatePaystackFunding);
//paystack verification payment
router.post("/fund/paystack/verify", authMiddleware, verifyPaystackPayment);

module.exports = router;
