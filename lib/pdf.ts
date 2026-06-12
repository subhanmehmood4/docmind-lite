import { extractText, getDocumentProxy } from "unpdf";
import { MAX_PDF_PAGES } from "./constants";

export interface PageText {
  page: number;
  text: string;
}

export async function extractPagesFromPdf(buffer: Buffer): Promise<PageText[]> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { totalPages, text } = await extractText(pdf, { mergePages: false });

  if (totalPages > MAX_PDF_PAGES) {
    throw new Error(
      `PDF has ${totalPages} pages. Maximum allowed is ${MAX_PDF_PAGES} pages.`
    );
  }

  return text
    .map((pageText, index) => ({ page: index + 1, text: pageText.trim() }))
    .filter((entry) => entry.text.length > 0);
}

export function hasExtractableText(pages: PageText[]): boolean {
  const totalChars = pages.reduce((sum, page) => sum + page.text.length, 0);
  return totalChars >= 50;
}
