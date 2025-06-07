const nodemailer = require("nodemailer");

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send a meeting invitation email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.title - Meeting title
 * @param {string} options.description - Meeting description
 * @param {Date} options.startDate - Meeting start date
 * @param {Date} options.endDate - Meeting end date
 * @param {string} options.meetingId - Meeting ID
 * @returns {Promise} - Promise resolving to email sending result
 */
const sendMeetingInvitation = async ({
  to,
  title,
  description,
  startDate,
  endDate,
  meetingId,
}) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: `Meeting Invitation: ${title}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meeting Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <!-- Main Container -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
            <td align="center">
                <!-- Email Content -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 600px;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); background-color: #4f46e5; padding: 30px 40px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0 0 10px 0;">📅 Meeting Invitation</h1>
                            <p style="color: #e0e7ff; font-size: 16px; margin: 0;">You're invited to join our meeting</p>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px;">
                            
                            <!-- Meeting Title -->
                            <h2 style="color: #1f2937; font-size: 24px; font-weight: bold; margin: 0 0 30px 0; text-align: center;">
                                ${title}
                            </h2>
                            
                            <!-- Meeting Details Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 25px;">
                                        
                                        <!-- Description -->
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                                            <tr>
                                                <td width="100" style="vertical-align: top; padding-right: 15px;">
                                                    <div style="background-color: #4f46e5; color: white; padding: 8px; border-radius: 6px; text-align: center; font-weight: bold; font-size: 12px;">
                                                        📝 DESC
                                                    </div>
                                                </td>
                                                <td style="vertical-align: top;">
                                                    <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.5;">
                                                        ${
                                                          description ||
                                                          "No description provided"
                                                        }
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Date & Time -->
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                                            <tr>
                                                <td width="100" style="vertical-align: top; padding-right: 15px;">
                                                    <div style="background-color: #059669; color: white; padding: 8px; border-radius: 6px; text-align: center; font-weight: bold; font-size: 12px;">
                                                        📅 DATE
                                                    </div>
                                                </td>
                                                <td style="vertical-align: top;">
                                                    <p style="margin: 0; color: #374151; font-size: 16px; font-weight: 600;">
                                                        ${new Date(
                                                          startDate
                                                        ).toLocaleString()}
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Duration -->
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                                            <tr>
                                                <td width="100" style="vertical-align: top; padding-right: 15px;">
                                                    <div style="background-color: #0891b2; color: white; padding: 8px; border-radius: 6px; text-align: center; font-weight: bold; font-size: 12px;">
                                                        ⏰ TIME
                                                    </div>
                                                </td>
                                                <td style="vertical-align: top;">
                                                    <p style="margin: 0; color: #374151; font-size: 16px; font-weight: 600;">
                                                        ${new Date(
                                                          startDate
                                                        ).toLocaleTimeString()} - ${new Date(
        endDate
      ).toLocaleTimeString()}
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Meeting Link -->
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td width="100" style="vertical-align: top; padding-right: 15px;">
                                                    <div style="background-color: #dc2626; color: white; padding: 8px; border-radius: 6px; text-align: center; font-weight: bold; font-size: 12px;">
                                                        🔗 LINK
                                                    </div>
                                                </td>
                                                <td style="vertical-align: top;">
                                                    <a href="${
                                                      process.env.CLIENT_URL
                                                    }/meeting/waiting/${meetingId}" 
                                                       style="background-color: #0891b2; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                                                        🚀 Join Meeting Room
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Action Buttons -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" id="actionButtons">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <table cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <!-- Accept Button -->
                                                <td style="padding-right: 15px;">
                                                    <a href="${
                                                      process.env.API_URL
                                                    }/api/meeting/accept/${meetingId}?email=${encodeURIComponent(
        to
      )}" 
                                                       onclick="handleResponse('accept', this.href); return false;"
                                                       style="background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                                                        ✅ Accept Invitation
                                                    </a>
                                                </td>
                                                <!-- Decline Button -->
                                                <td style="padding-left: 15px;">
                                                    <a href="${
                                                      process.env.API_URL
                                                    }/api/meeting/decline/${meetingId}?email=${encodeURIComponent(
        to
      )}" 
                                                       onclick="handleResponse('decline', this.href); return false;"
                                                       style="background-color: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                                                        ❌ Decline Invitation
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Response Status (Hidden by default) -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" id="responseStatus" style="display: none;">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <div id="statusMessage" style="background-color: #f0f9ff; border: 2px solid #0891b2; border-radius: 8px; padding: 20px; text-align: center;">
                                            <p style="margin: 0; color: #0c4a6e; font-size: 16px; font-weight: bold;">
                                                Processing your response...
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Reminder Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 6px; margin-top: 25px;">
                                <tr>
                                    <td style="padding: 20px; text-align: center;">
                                        <p style="margin: 0; color: #92400e; font-size: 14px;">
                                            <strong>💡 Reminder:</strong> Please join the meeting at the scheduled time. 
                                            We recommend joining 5 minutes early to test your setup.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 25px 40px; text-align: center; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0; color: #6b7280; font-size: 12px;">
                                This is an automated message, please do not reply to this email.
                            </p>
                            <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 11px;">
                                © 2025 Your Company Name. All rights reserved.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
    
    <script>
        function handleResponse(action, url) {
            // Hide the action buttons
            document.getElementById('actionButtons').style.display = 'none';
            
            // Show the status message
            const statusElement = document.getElementById('responseStatus');
            const messageElement = document.getElementById('statusMessage');
            
            statusElement.style.display = 'table';
            
            // Update message based on action
            if (action === 'accept') {
                messageElement.innerHTML = \`
                    <p style="margin: 0; color: #065f46; font-size: 16px; font-weight: bold;">
                        ✅ Thank you! You have accepted the meeting invitation.
                    </p>
                    <p style="margin: 10px 0 0 0; color: #047857; font-size: 14px;">
                        Processing your response...
                    </p>
                \`;
                messageElement.parentElement.style.backgroundColor = '#ecfdf5';
                messageElement.parentElement.style.borderColor = '#10b981';
            } else {
                messageElement.innerHTML = \`
                    <p style="margin: 0; color: #7f1d1d; font-size: 16px; font-weight: bold;">
                        ❌ You have declined the meeting invitation.
                    </p>
                    <p style="margin: 10px 0 0 0; color: #991b1b; font-size: 14px;">
                        Processing your response...
                    </p>
                \`;
                messageElement.parentElement.style.backgroundColor = '#fef2f2';
                messageElement.parentElement.style.borderColor = '#ef4444';
            }
            
            // Make the actual request
            setTimeout(() => {
                window.location.href = url;
            }, 1500);
        }
    </script>
</body>
</html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email: " + error.message);
  }
};

/**
 * Send a meeting reminder email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.title - Meeting title
 * @param {Date} options.startDate - Meeting start date
 * @param {string} options.meetingId - Meeting ID
 * @returns {Promise} - Promise resolving to email sending result
 */
const sendMeetingReminder = async ({ to, title, startDate, meetingId }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: `Reminder: ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Meeting Reminder</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Time:</strong> ${new Date(
              startDate
            ).toLocaleString()}</p>
            <p><strong>Meeting ID:</strong> ${meetingId}</p>
          </div>
          <p style="margin-top: 20px;">The meeting is starting soon. Please join on time.</p>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Reminder email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending reminder email:", error);
    throw new Error("Failed to send reminder email: " + error.message);
  }
};

/**
 * Send a meeting response notification to the meeting creator
 * @param {Object} options - Email options
 * @param {string} options.to - Creator's email address
 * @param {string} options.title - Meeting title
 * @param {string} options.participantName - Name of the participant who responded
 * @param {string} options.response - Response type ('accepted' or 'declined')
 * @returns {Promise} - Promise resolving to email sending result
 */
const sendMeetingResponseNotification = async ({
  to,
  title,
  participantName,
  response,
}) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: `Meeting Response: ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Meeting Response</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
            <p><strong>Meeting Title:</strong> ${title}</p>
            <p><strong>Participant:</strong> ${participantName}</p>
            <p><strong>Response:</strong> <span style="color: ${
              response === "accepted" ? "#4CAF50" : "#f44336"
            }">${response}</span></p>
          </div>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Response notification sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending response notification:", error);
    throw new Error("Failed to send response notification: " + error.message);
  }
};

/**
 * Send an exam notification email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.examId - Exam ID
 * @param {string} options.initial_language - Initial language
 * @param {string} options.target_language - Target language
 * @returns {Promise} - Promise resolving to email sending result
 */
const sendExamNotification = async ({
  to,
  examId,
  initial_language,
  target_language,
}) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: `New Translation Exam Available`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Translation Exam</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
            <p><strong>Language Pair:</strong> ${initial_language} → ${target_language}</p>
            <p><strong>Exam ID:</strong> ${examId}</p>
          </div>
          <p style="margin-top: 20px;">A new translation exam has been generated for you. Click the button below to start the exam.</p>
          <div style="margin-top: 20px; text-align: center;">
            <a href="${process.env.CLIENT_URL}/exam/${examId}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Start Exam
            </a>
          </div>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Exam notification email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending exam notification:", error);
    throw new Error("Failed to send exam notification: " + error.message);
  }
};

module.exports = {
  sendMeetingInvitation,
  sendMeetingReminder,
  sendMeetingResponseNotification,
  sendExamNotification,
};
