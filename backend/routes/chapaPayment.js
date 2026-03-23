const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/pay", async (req, res) => {
  const { email, amount, first_name, last_name } = req.body;

  try {
    const response = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        amount: amount,
        currency: "ETB",
        email: email,
        first_name: first_name,
        last_name: last_name,
        tx_ref: "tx-" + Date.now(),
        callback_url: "http://localhost:5000/api/verify-payment",
        return_url: "http://localhost:3000/success",
      },
      {
        headers: {
          Authorization: "CHASECK_TEST-WkIFYnNAoscOkZGTknnxP7hhPA4J2nTX",
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ checkout_url: response.data.data.checkout_url });

  } catch (error) {
    res.status(500).json({ message: "Payment initialization failed" });
  }
});
router.get("/verify-payment", async (req, res) => {
  const { tx_ref } = req.query;

  try {
    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: "Bearer YOUR_CHAPA_SECRET_KEY",
        },
      }
    );

    if (response.data.status === "success") {
      // save to database here
      console.log("Payment successful!");
    }

    res.send("Payment verified");
  } catch (error) {
    res.status(500).send("Verification failed");
  }
});

module.exports = router;