import { createClient, PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseKey } from "./env";

let client: SupabaseClient | null = null;

function supabaseError(error: PostgrestError): Error {
  return new Error(error.message);
}

function parseEmbedding(value: unknown): number[] {
  if (Array.isArray(value)) {
    return value as number[];
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as number[];
    } catch {
      return [];
    }
  }

  return [];
}

function cosineSimilarity(a: number[], b: number[]): number {
  const length = Math.min(a.length, b.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getSupabaseKey();

  if (!url || !key) {
    throw new Error("Supabase environment variables are not configured");
  }

  client = createClient(url, key);
  return client;
}

export interface DocumentRow {
  content: string;
  page: number;
  embedding: number[];
}

export interface MatchedDocument {
  id: number;
  content: string;
  page: number;
  similarity: number;
}

export async function clearDocuments(): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("documents").delete().gte("id", 0);
  if (error) throw supabaseError(error);
}

export async function insertDocuments(rows: DocumentRow[]): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("documents").insert(rows);
  if (error) throw supabaseError(error);
}

async function matchDocumentsFallback(
  embedding: number[],
  matchCount: number
): Promise<MatchedDocument[]> {
  const supabase = getSupabase();
  const { data: rows, error } = await supabase
    .from("documents")
    .select("id, content, page, embedding");

  if (error) throw supabaseError(error);
  if (!rows?.length) return [];

  return rows
    .map((row) => ({
      id: row.id as number,
      content: row.content as string,
      page: row.page as number,
      similarity: cosineSimilarity(embedding, parseEmbedding(row.embedding)),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, matchCount);
}

export async function matchDocuments(
  embedding: number[],
  matchCount = 5
): Promise<MatchedDocument[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_count: matchCount,
  });

  if (error) throw supabaseError(error);

  const matches = (data ?? []) as MatchedDocument[];
  if (matches.length > 0) {
    return matches;
  }

  // IVFFlat index returns empty results on small datasets (< lists count)
  return matchDocumentsFallback(embedding, matchCount);
}

export async function hasDocuments(): Promise<boolean> {
  const supabase = getSupabase();
  const { count, error } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true });

  if (error) throw supabaseError(error);
  return (count ?? 0) > 0;
}
