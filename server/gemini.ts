import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface GeneratedQuestion {
  question: string;
  options: string[];
  answer: number;
}

export async function generateQuizQuestions(
  lessonText: string,
  numberOfQuestions: number = 10
): Promise<GeneratedQuestion[]> {
  const prompt = `You are an expert quiz creator for educational content. Based on the following lesson content, create ${numberOfQuestions} multiple-choice questions that test understanding of the key concepts.

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, just raw JSON.

Format your response as a JSON array:
[
  {
    "question": "Clear, educational question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 0
  }
]

Where "answer" is the index (0-3) of the correct option.

Guidelines:
- Questions should test comprehension, not just recall
- All options should be plausible
- Questions should vary in difficulty
- Cover different aspects of the lesson content
- Keep questions clear and concise

Lesson Content:
${lessonText}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text || "";
    
    // Clean up the response - remove markdown code blocks if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    const questions: GeneratedQuestion[] = JSON.parse(cleanedText);

    // Validate and sanitize
    return questions.slice(0, numberOfQuestions).map((q, index) => ({
      question: q.question || `Question ${index + 1}`,
      options: (q.options || ["A", "B", "C", "D"]).slice(0, 4),
      answer: typeof q.answer === "number" && q.answer >= 0 && q.answer <= 3 ? q.answer : 0,
    }));
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz questions. Please try again.");
  }
}
