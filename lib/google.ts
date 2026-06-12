import { GoogleGenerativeAI } from "@google/generative-ai";
import { CHAT_MODEL, EMBEDDING_MODEL } from "./constants";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });

  const result = await model.batchEmbedContents({
    requests: texts.map((text) => ({
      content: { role: "user", parts: [{ text }] },
    })),
  });

  return result.embeddings.map((embedding) => embedding.values);
}

export async function embedQuery(text: string): Promise<number[]> {
  const [embedding] = await embedTexts([text]);
  return embedding;
}

const SYSTEM_PROMPT = `You are DocMind, a precise document assistant. Answer the user's question using ONLY the provided context from their document. If the answer is not in the context, say 'I couldn't find that in the document.' Always be concise. After your answer, do not invent page numbers — only reference pages present in the context.`;

export async function chatWithContext(
  context: string,
  question: string
): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: CHAT_MODEL,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: { temperature: 0.2 },
  });

  const result = await model.generateContent(`Context from the document:
---
${context}
---
Question: ${question}

Answer using only the context above.`);

  return (
    result.response.text()?.trim() ?? "I couldn't find that in the document."
  );
}
