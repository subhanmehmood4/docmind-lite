import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseKey } from "./env";

let client: SupabaseClient | null = null;

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
  if (error) throw error;
}

export async function insertDocuments(rows: DocumentRow[]): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("documents").insert(rows);
  if (error) throw error;
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

  if (error) throw error;
  return (data ?? []) as MatchedDocument[];
}
