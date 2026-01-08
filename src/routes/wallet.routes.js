const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const {
  getWalletBalance,
  fundWallet,
  transferWallet,
} = require("../controllers/wallet.controller");

//this collects the wallet balance
router.get("/balance", authMiddleware, getWalletBalance);
//to fund the wallet
router.post("/fund", authMiddleware, fundWallet);
//for tranferring funds between wallets
router.post("/transfer", authMiddleware, transferWallet);

module.exports = router;
