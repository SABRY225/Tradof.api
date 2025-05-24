const express = require("express");
const router = express.Router();
const meetingResponseService = require("../services/meetingResponseService");
const { getTokenFromDotNet } = require("../helpers/getToken");

// Middleware to verify token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers["authorization"];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const user = await getTokenFromDotNet(token);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Handle meeting response (both GET and POST)
const handleResponse = async (req, res, responseType) => {
  try {
    const { meetingId } = req.params;
    let userEmail;

    if (req.method === "GET") {
      // For GET requests, get email from query parameter
      userEmail = req.query.email;
      if (!userEmail) {
        return res.send(`
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 5px; background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;">
            <h2>Error</h2>
            <p>Email is required to process your response.</p>
          </div>
        `);
      }
    } else {
      // For POST requests, get email from authenticated user
      userEmail = req.user.email;
    }

    const result = await meetingResponseService.handleMeetingResponse(
      meetingId,
      userEmail,
      responseType
    );

    // Return a simple HTML response for both GET and POST
    res.send(`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 5px; background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;">
        <h2>Meeting Response Processed</h2>
        <p>Your meeting invitation has been ${responseType} successfully.</p>
        <p>You can close this window.</p>
      </div>
    `);
  } catch (error) {
    res.send(`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 5px; background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;">
        <h2>Error</h2>
        <p>${error.message}</p>
      </div>
    `);
  }
};

// Accept meeting invitation (both GET and POST)
router.get("/accept/:meetingId", async (req, res) => {
  await handleResponse(req, res, "accepted");
});

router.post("/accept/:meetingId", verifyToken, async (req, res) => {
  await handleResponse(req, res, "accepted");
});

// Decline meeting invitation (both GET and POST)
router.get("/decline/:meetingId", async (req, res) => {
  await handleResponse(req, res, "declined");
});

router.post("/decline/:meetingId", verifyToken, async (req, res) => {
  await handleResponse(req, res, "declined");
});

module.exports = router;
