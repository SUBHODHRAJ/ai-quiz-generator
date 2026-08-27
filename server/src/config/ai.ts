export const aiConfig = {
  provider: (process.env.AI_PROVIDER || "gemini").toLowerCase(),

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash"
  },

  groq: {
    apiKey: process.env.GROQ_API_KEY || "",
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile"
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
    model: process.env.OPENAI_MODEL || "gpt-4o-mini"
  }
};

