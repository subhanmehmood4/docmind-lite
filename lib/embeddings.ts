import { HfInference } from "@huggingface/inference";
import { EMBEDDING_MODEL } from "./constants";

function getClient() {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error("HUGGINGFACE_API_KEY is not configured");
  }
  return new HfInference(apiKey);
}

function poolEmbedding(raw: number[] | number[][]): number[] {
  if (raw.length === 0) return [];

  if (typeof raw[0] === "number") {
    return raw as number[];
  }

  const tokens = raw as number[][];
  const dim = tokens[0]?.length ?? 0;
  const pooled = new Array(dim).fill(0);

  for (const token of tokens) {
    for (let i = 0; i < dim; i++) {
      pooled[i] += token[i] ?? 0;
    }
  }

  return pooled.map((value) => value / tokens.length);
}

async function embedSingle(text: string): Promise<number[]> {
  const hf = getClient();
  const result = await hf.featureExtraction({
    model: EMBEDDING_MODEL,
    inputs: text,
  });

  return poolEmbedding(result as number[] | number[][]);
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  // Hugging Face free tier: batch sequentially to avoid rate limits
  const embeddings: number[][] = [];
  for (const text of texts) {
    embeddings.push(await embedSingle(text));
  }
  return embeddings;
}

export async function embedQuery(text: string): Promise<number[]> {
  return embedSingle(text);
}
