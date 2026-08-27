import axios from "axios";
import { aiConfig } from "../../config/ai";

export interface GeneratedQuestion {
  question: string;
  type: "mcq" | "true_false" | "short_answer";
  options?: string[];
  answer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  source?: string;
}

export interface GeneratedQuiz {
  title: string;
  description: string;
  topic: string;
  questions: GeneratedQuestion[];
}

const systemInstruction = `
You are an expert educational assessment generator.

Create high-quality practice questions ONLY from the supplied study material.

Rules:
1. Do not invent facts that are not supported by the material.
2. Questions must test understanding, not just memorization.
3. Every question must have a correct answer.
4. Every question must have a clear explanation.
5. MCQ options must contain exactly one correct answer.
6. Avoid duplicate questions.
7. Use the source material for references.
8. Return ONLY valid JSON.
`;

function buildPrompt(
  text: string,
  questionCount: number,
  difficulty: string,
  questionTypes: string[]
) {
  return `
${systemInstruction}

Generate a quiz from the following study material.

Requested number of questions:
${questionCount}

Difficulty:
${difficulty}

Allowed question types:
${questionTypes.join(", ")}

Return exactly this JSON structure:

{
  "title": "string",
  "description": "string",
  "topic": "string",
  "questions": [
    {
      "question": "string",
      "type": "mcq",
      "options": ["A", "B", "C", "D"],
      "answer": "string",
      "explanation": "string",
      "difficulty": "easy",
      "source": "string"
    }
  ]
}

For true_false:
- options should be ["True", "False"]

For short_answer:
- options should be omitted.

Study material:
----------------
${text}
----------------
`;
}

async function generateWithGemini(prompt: string): Promise<string> {
  if (!aiConfig.gemini.apiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${aiConfig.gemini.model}:generateContent?key=${aiConfig.gemini.apiKey}`;

  const response = await axios.post(
    url,
    {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json"
      }
    },
    {
      timeout: 120000
    }
  );

  return (
    response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    ""
  );
}

async function generateWithGroq(prompt: string): Promise<string> {
  if (!aiConfig.groq.apiKey) {
    throw new Error("GROQ_API_KEY is missing");
  }

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: aiConfig.groq.model,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: "You are an expert educational quiz generator. Return valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_object"
      }
    },
    {
      headers: {
        Authorization: `Bearer ${aiConfig.groq.apiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 120000
    }
  );

  return response.data?.choices?.[0]?.message?.content || "";
}

function cleanJson(text: string): string {
  let cleaned = text.trim();

  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "");
  }

  return cleaned.trim();
}

export async function generateQuiz(
  text: string,
  questionCount = 10,
  difficulty = "medium",
  questionTypes = ["mcq", "true_false", "short_answer"]
): Promise<GeneratedQuiz> {

  if (!text.trim()) {
    throw new Error("Study material is empty");
  }

  const prompt = buildPrompt(
    text,
    questionCount,
    difficulty,
    questionTypes
  );

  let raw: string;

  if (aiConfig.provider === "groq") {
    raw = await generateWithGroq(prompt);
  } else {
    raw = await generateWithGemini(prompt);
  }

  const cleaned = cleanJson(raw);

  let parsed: GeneratedQuiz;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error("AI response does not contain valid questions");
  }

  parsed.questions = parsed.questions.slice(0, questionCount);

  return parsed;
}
