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
You are an expert enterprise training and educational assessment generator.

Create high-quality, practical practice questions ONLY from the supplied study or workforce training material.

Rules:
1. Do not invent facts that are not supported by the material.
2. Questions must test understanding, procedures, and practical application.
3. Every question must have a correct answer.
4. Every question must have a clear explanation citing the document context.
5. MCQ options must contain exactly 4 options (A, B, C, D) with exactly one unambiguous correct answer.
6. For true_false, options must be exactly ["True", "False"].
7. For short_answer, do not supply options.
8. Avoid repetitive phrasing.
9. Return ONLY valid JSON matching the exact schema.
`;

function buildPrompt(
  text: string,
  questionCount: number,
  difficulty: string,
  questionTypes: string[],
  instructions?: string
) {
  const customNote = instructions?.trim()
    ? `\nSpecial instructions for this assessment:\n${instructions.trim()}\n`
    : "";

  return `
${systemInstruction}
${customNote}
Generate an assessment quiz from the following study material.

Requested number of questions: ${questionCount}
Target difficulty: ${difficulty}
Allowed question types: ${questionTypes.join(", ")}

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
      "difficulty": "${difficulty}",
      "source": "Source: Uploaded training material"
    }
  ]
}

Study material:
----------------
${text.slice(0, 30000)}
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
  questionTypes = ["mcq", "true_false", "short_answer"],
  instructions?: string
): Promise<GeneratedQuiz> {
  if (!text.trim()) {
    throw new Error("Study material is empty");
  }

  const prompt = buildPrompt(
    text,
    questionCount,
    difficulty,
    questionTypes,
    instructions
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

  // Ensure every question has required properties and valid options
  parsed.questions = parsed.questions.slice(0, questionCount).map((q, idx) => {
    const type = ["mcq", "true_false", "short_answer"].includes(q.type) ? q.type : "mcq";
    let options = q.options;

    if (type === "true_false") {
      options = ["True", "False"];
    } else if (type === "mcq" && (!options || options.length < 2)) {
      options = ["Option A", "Option B", "Option C", "Option D"];
    } else if (type === "short_answer") {
      options = undefined;
    }

    return {
      question: q.question || `Question ${idx + 1}`,
      type,
      options,
      answer: q.answer || (type === "true_false" ? "True" : "Answer"),
      explanation: q.explanation || "Derived from training documentation.",
      difficulty: ["easy", "medium", "hard"].includes(q.difficulty) ? q.difficulty : (difficulty as any),
      source: q.source || "Source: Uploaded training material"
    };
  });

  return parsed;
}

export async function regenerateSingleQuestion(
  topic: string,
  type: "mcq" | "true_false" | "short_answer" = "mcq",
  difficulty: "easy" | "medium" | "hard" = "medium",
  sourceSnippet?: string
): Promise<GeneratedQuestion> {
  const prompt = `
You are an expert assessment designer. Generate a NEW, HIGH-QUALITY single assessment question about "${topic}".
Question Type: ${type}
Difficulty: ${difficulty}
${sourceSnippet ? `Context material:\n${sourceSnippet.slice(0, 4000)}` : ""}

Return ONLY valid JSON matching this exact structure:
{
  "question": "string",
  "type": "${type}",
  ${type === "mcq" ? '"options": ["A", "B", "C", "D"],' : type === "true_false" ? '"options": ["True", "False"],' : ""}
  "answer": "string",
  "explanation": "string",
  "difficulty": "${difficulty}",
  "source": "Source: Uploaded training material"
}
`;

  let raw: string;
  if (aiConfig.provider === "groq") {
    raw = await generateWithGroq(prompt);
  } else {
    raw = await generateWithGemini(prompt);
  }

  const parsed = JSON.parse(cleanJson(raw));
  return {
    question: parsed.question,
    type: parsed.type || type,
    options: type === "true_false" ? ["True", "False"] : type === "mcq" ? parsed.options || ["Option A", "Option B", "Option C", "Option D"] : undefined,
    answer: parsed.answer,
    explanation: parsed.explanation || "Detailed concept explanation.",
    difficulty: parsed.difficulty || difficulty,
    source: parsed.source || "Source: Uploaded training material"
  };
}

export async function enhanceQuestionExplanation(
  question: string,
  answer: string,
  currentExplanation: string,
  style: "simpler" | "detailed" = "detailed"
): Promise<string> {
  const prompt = `
Given this assessment question and answer:
Question: ${question}
Answer: ${answer}
Current Explanation: ${currentExplanation}

Please rewrite and improve this explanation to be ${style === "simpler" ? "simpler, concise, and easy to understand for beginners" : "comprehensive, clear, and actionable for workforce training"}.

Return ONLY valid JSON:
{
  "explanation": "string"
}
`;

  let raw: string;
  if (aiConfig.provider === "groq") {
    raw = await generateWithGroq(prompt);
  } else {
    raw = await generateWithGemini(prompt);
  }

  const parsed = JSON.parse(cleanJson(raw));
  return parsed.explanation || currentExplanation;
}
