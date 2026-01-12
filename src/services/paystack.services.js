const axios = require("axios");

const PAYSTACK_BASE_URL = "https://api.paystack.co";

const initializePayment = async ({ email, amount }) => {
  const response = await axios.post(
    `${PAYSTACK_BASE_URL}/transaction/initialize`,
    {
      email,
      amount: amount * 100,
      callback_url: "http://localhost:3000/dashboard",
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

const verifyPayment = async (reference) => {
  const response = await axios.get(
    `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );
  return response.data;
};

module.exports = {
  initializePayment,
  verifyPayment,
};
