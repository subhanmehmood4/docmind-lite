import OpenAI from "openai";
import { CHAT_MODEL, GROQ_BASE_URL } from "./constants";

function getClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  return new OpenAI({
    apiKey,
    baseURL: GROQ_BASE_URL,
  });
}

const SYSTEM_PROMPT = `You are DocMind, a precise document assistant. Answer the user's question using ONLY the provided context from their document. If the answer is not in the context, say 'I couldn't find that in the document.' Always be concise. After your answer, do not invent page numbers — only reference pages present in the context.`;

export async function chatWithContext(
  context: string,
  question: string
): Promise<string> {
  const client = getClient();
  const response = await client.chat.completions.create({
    model: CHAT_MODEL,
    temperature: 0.2,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Context from the document:
---
${context}
---
Question: ${question}

Answer using only the context above.`,
      },
    ],
  });

  return (
    response.choices[0]?.message?.content?.trim() ??
    "I couldn't find that in the document."
  );
}
