const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const {
  getWalletBalance,
  fundWallet,
} = require("../controllers/wallet.controller");

//this collects the wallet balance
router.get("/balance", authMiddleware, getWalletBalance);
router.post("/fund", authMiddleware, fundWallet);

module.exports = router;
