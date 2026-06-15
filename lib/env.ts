export function getSupabaseKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function getEnvStatus() {
  return {
    groq: !!process.env.GROQ_API_KEY,
    huggingface: !!process.env.HUGGINGFACE_API_KEY,
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: !!getSupabaseKey(),
  };
}

export function getMissingEnvVars(): string[] {
  const missing: string[] = [];
  if (!process.env.GROQ_API_KEY) missing.push("GROQ_API_KEY");
  if (!process.env.HUGGINGFACE_API_KEY) missing.push("HUGGINGFACE_API_KEY");
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!getSupabaseKey()) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return missing;
}

export function isFullyConfigured(): boolean {
  return getMissingEnvVars().length === 0;
}
