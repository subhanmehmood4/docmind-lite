import { getMissingEnvVars } from "@/lib/env";
import { NextResponse } from "next/server";
import { MATCH_COUNT } from "@/lib/constants";
import { chatWithContext, embedQuery } from "@/lib/google";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { matchDocuments } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ChatRequestBody {
  question?: string;
}

export async function POST(request: Request) {
  try {
    const missing = getMissingEnvVars();
    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: `Server not configured. Add ${missing.join(", ")} to .env.local and restart the dev server.`,
        },
        { status: 503 }
      );
    }

    const ip = getClientIp(request);
    const rate = checkRateLimit(ip);
    if (!rate.ok) {
      return NextResponse.json(
        { error: `Too many requests. Try again in ${rate.retryAfter}s.` },
        { status: 429 }
      );
    }

    const body = (await request.json()) as ChatRequestBody;
    const question = body.question?.trim();

    if (!question) {
      return NextResponse.json({ error: "Question is required." }, { status: 400 });
    }

    if (question.length > 1000) {
      return NextResponse.json(
        { error: "Question is too long (max 1000 characters)." },
        { status: 400 }
      );
    }

    const queryEmbedding = await embedQuery(question);
    const matches = await matchDocuments(queryEmbedding, MATCH_COUNT);

    if (matches.length === 0) {
      return NextResponse.json({
        answer:
          "No document has been uploaded yet. Please upload a PDF first.",
        citations: [],
      });
    }

    const context = matches
      .map(
        (match) =>
          `[Page ${match.page}]\n${match.content}`
      )
      .join("\n\n---\n\n");

    const answer = await chatWithContext(context, question);

    const citations = matches.slice(0, 3).map((match) => ({
      content: match.content,
      page: match.page,
      similarity: match.similarity,
    }));

    return NextResponse.json({ answer, citations });
  } catch (error) {
    console.error("Chat error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate answer.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
