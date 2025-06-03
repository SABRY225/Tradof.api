const { mediumExam, cleanJsonResponse } = require("../helpers/examHelpers");

const model_name = "gemini-2.0-flash";
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Helper function to delay execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main({ initial_language, target_language }) {
  let retries = 0;
  let lastError = null;

  while (retries < MAX_RETRIES) {
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API });

      const response = await ai.models.generateContent({
        model: model_name,
        contents: mediumExam({ initial_language, target_language }),
      });

      const responseText = await response.text;
      console.log(responseText);

      const cleanedText = cleanJsonResponse(responseText);
      return cleanedText;
    } catch (error) {
      lastError = error;

      // Check if it's a 503 error
      if (error.message && error.message.includes("503")) {
        retries++;
        if (retries < MAX_RETRIES) {
          // Calculate delay with exponential backoff
          const delayTime = INITIAL_RETRY_DELAY * Math.pow(2, retries - 1);
          console.log(
            `Attempt ${retries} failed. Retrying in ${delayTime}ms...`
          );
          await delay(delayTime);
          continue;
        }
      }

      // If it's not a 503 error or we've exhausted retries, throw the error
      throw error;
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError;
}

module.exports = main;
