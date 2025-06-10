const mediumExam = ({ initial_language, target_language }) => {
  return `
    You are an AI language expert. Your task is to generate a professional translation exam in structured JSON format only.

🎯 Exam Type: Translation Proficiency Exam  
🧠 Difficulty: Medium  
📊 Question Count: 50 multiple-choice questions (MCQs)

🌐 Language Pair: ${initial_language} ↔ ${target_language}  
📚 Fields to Cover: Choose 2-3 of the following: Medical, Legal, Technical, Business, Academic, Government

📘 Section Breakdown:
- listening_comprehension: 10 questions (2 audio transcripts, each followed by 5 questions)
- reading_translation: 15 questions (3 texts * 5 questions each)
- vocabulary: 12 questions
- grammar_syntax: 13 questions

🧾 MCQ Options:
A = Fully correct  
B = Literal or common error  
C = Grammatically correct but contextually wrong  
D = Irrelevant or wrong

✅ Output Instructions:
- Output ONLY a **valid JSON object**.
- Do NOT include explanations, markdown, or extra text.
- Start with \` { \` and end with \` } \`.
- Format should exactly follow this structure:

{
  "language_pair": "English ↔ Arabic",
  "difficulty": "medium",
  "fields": ["Medical", "Legal", "Technical"],
  "sections": {
    "listening_comprehension": [
      {
        "audio_title": "Doctor Consultation",
        "transcript": "Doctor: Have you experienced chest pain recently? Patient: Only when I climb stairs.",
        "audio_lang":"language that transcript will read be it",
        "questions": [
          {
            "question_number": 1,
            "question": "What is the correct translation of 'chest pain' in this medical context?",
            "options": [
              "A: Accurate medical term",
              "B: Literal translation",
              "C: Informal phrasing",
              "D: Incorrect term"
            ],
            "correct_answer": "A",
            "explanation": "A is the correct medical term; others are less accurate or incorrect."
          }
        ]
      }
    ],
    "reading_translation": [
      {
        "source_text": "This contract is subject to termination under clause 4.2.",
        "questions": [...]
      }
    ],
    "vocabulary": [
      {
        "term": "jurisdiction",
        "context": "The court ruled that it had no jurisdiction.",
        "question_number": 27,
        "question": "What is the best translation for 'jurisdiction' in a legal context?",
        "options": [
          "A: Correct legal term",
          "B: Common misinterpretation",
          "C: Informal version",
          "D: Irrelevant term"
        ],
        "correct_answer": "A",
        "explanation": "A reflects accurate legal terminology."
      }
    ],
    "grammar_syntax": [
      {
        "question_number": 45,
        "sentence": "The data, which was collected over several months, is conclusive.",
        "question": "Which translation preserves the correct relative clause structure?",
        "options": [
          "A: Correct clause usage",
          "B: Sentence fragment",
          "C: Incorrect tense",
          "D: Mistranslation of clause"
        ],
        "correct_answer": "A",
        "explanation": "A maintains meaning and structure; others are flawed."
      }
    ]
  }
} 
`;
};

function cleanJsonResponse(response) {
  try {
    // Remove any potential markdown code blocks and clean up the string
    let cleaned = response
      .replace(/```json/g, "")
      // .replace(/```/g, "")
      // .replace(/\\n/g, "")
      // .replace(/\\"/g, '"')
      .trim();

    
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No valid JSON object found in response");
    }
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    const parsed = JSON.parse(cleaned);
    
    return parsed;
  } catch (parseError) {
    console.error("JSON parsing error:", parseError.message);
    throw new Error(`Failed to clean JSON response: ${parseError.message}`);
  }
}

module.exports = {
  mediumExam,
  cleanJsonResponse,
};
