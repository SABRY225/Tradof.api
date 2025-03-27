const axios = require("axios");
const https = require("https");

async function getTokenFromDotNet(token) {
  try {
    const response = await axios.get(
      "https://localhost:44386/api/Auth/user-data-with-token",
      {
        headers: { Authorization: `Bearer ${token}` },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }), // ✅ تجاوز شهادة SSL الذاتية
      }
    );
    return response.data;
  } catch (error) {
    return { error: "Failed to connect" };
  }
}

module.exports = { getTokenFromDotNet };
