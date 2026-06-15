import { getMissingEnvVars } from "@/lib/env";
import { NextResponse } from "next/server";
import { chunkPages } from "@/lib/chunk";
import { MAX_PDF_SIZE_BYTES } from "@/lib/constants";
import { embedTexts } from "@/lib/embeddings";
import { extractPagesFromPdf, hasExtractableText } from "@/lib/pdf";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { clearDocuments, insertDocuments } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

const EMBED_BATCH_SIZE = 20;

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

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No PDF file provided." }, { status: 400 });
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are supported." },
        { status: 400 }
      );
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      return NextResponse.json(
        { error: "PDF exceeds the 10MB size limit." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let pages;

    try {
      pages = await extractPagesFromPdf(buffer);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to parse PDF.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (!hasExtractableText(pages)) {
      return NextResponse.json(
        {
          error:
            "This PDF has no extractable text. It may be scanned or image-only — try a PDF with selectable text.",
        },
        { status: 400 }
      );
    }

    const chunks = chunkPages(pages);
    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "No text could be extracted from this PDF." },
        { status: 400 }
      );
    }

    await clearDocuments();

    for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
      const batch = chunks.slice(i, i + EMBED_BATCH_SIZE);
      const embeddings = await embedTexts(batch.map((chunk) => chunk.content));
      const rows = batch.map((chunk, index) => ({
        content: chunk.content,
        page: chunk.page,
        embedding: embeddings[index],
      }));
      await insertDocuments(rows);
    }

    return NextResponse.json({
      success: true,
      chunks: chunks.length,
      pages: pages.length,
      filename: file.name,
    });
  } catch (error) {
    console.error("Ingest error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to process document.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
