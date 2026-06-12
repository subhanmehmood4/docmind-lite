export interface TextChunk {
  content: string;
  page: number;
}

const CHARS_PER_TOKEN = 4;

export function chunkPages(
  pages: Array<{ page: number; text: string }>,
  targetTokens = 600,
  overlapTokens = 100
): TextChunk[] {
  const chunkSize = targetTokens * CHARS_PER_TOKEN;
  const overlap = overlapTokens * CHARS_PER_TOKEN;
  const chunks: TextChunk[] = [];

  for (const { page, text } of pages) {
    if (!text.trim()) continue;

    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const content = text.slice(start, end).trim();

      if (content.length > 0) {
        chunks.push({ content, page });
      }

      if (end >= text.length) break;
      start = Math.max(start + 1, end - overlap);
    }
  }

  return chunks;
}
