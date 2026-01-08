const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const { getWalletBalance } = require("../controllers/wallet.controller");

//this collects the wallet balance
router.get("/balance", authMiddleware, getWalletBalance);

module.exports = router;
