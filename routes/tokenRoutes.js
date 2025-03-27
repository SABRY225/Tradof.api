const express = require("express");
const { getTokenFromDotNet } = require("../helpers/getToken");

const router = express.Router();

router.post("/validate", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

    const result = await getTokenFromDotNet(token);
    console.log(result)
  res.json(result);
});

module.exports = router;
