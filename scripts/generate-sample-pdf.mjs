import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const pages = [
  {
    title: "SERVICE AGREEMENT",
    body: `This Service Agreement ("Agreement") is entered into as of January 15, 2025, by and between: PARTY A: NovaTech Solutions Ltd., a company incorporated in England and Wales, with registered office at 42 Innovation Drive, London EC2A 4NE ("Provider"). PARTY B: Meridian Retail Group Inc., a Delaware corporation with principal place of business at 880 Commerce Blvd, Austin, TX 78701 ("Client"). WHEREAS, Provider offers AI-powered document intelligence services and Client wishes to engage Provider for such services, the parties agree as follows:`,
  },
  {
    title: "1. SCOPE OF SERVICES",
    body: `1.1 Provider shall deliver the DocMind platform, including document ingestion, vector search, and AI-powered Q&A with source citations. 1.2 Services include: (a) PDF document upload and text extraction; (b) embedding generation and vector storage; (c) natural language query interface; (d) citation-backed responses. 1.3 Provider will assign a dedicated implementation team of two engineers for the initial 5-week delivery period. 1.4 Out of scope: OCR for scanned documents, multi-tenant user authentication, and custom LLM fine-tuning.`,
  },
  {
    title: "2. TERM AND FEES",
    body: `2.1 Initial Term: This Agreement commences on January 15, 2025 and continues for twelve (12) months unless terminated earlier per Section 8. 2.2 Setup Fee: Client shall pay a one-time implementation fee of $45,000 USD within thirty (30) days of signing. 2.3 Monthly Subscription: $3,500 USD per month, billed on the 1st of each month, covering up to 10,000 document queries and 500GB storage. 2.4 Overage: Additional queries beyond 10,000/month are billed at $0.02 per query. Additional storage is $0.15 per GB/month. 2.5 Payment terms: Net 30. Late payments accrue interest at 1.5% per month.`,
  },
  {
    title: "3. SERVICE LEVELS",
    body: `3.1 Uptime: Provider guarantees 99.5% monthly uptime for the production environment, excluding scheduled maintenance windows (Sundays 2-4 AM UTC). 3.2 Response Time: API endpoints shall respond within 500ms at p95 under normal load conditions. 3.3 Support: Client receives email support with 4-hour response time during business hours (Mon-Fri, 9 AM-6 PM GMT). Critical incidents (P1) receive 1-hour response. 3.4 SLA Credits: If uptime falls below 99.5%, Client receives a service credit equal to 5% of the monthly fee for each 0.5% below the threshold, capped at 25% of monthly fees.`,
  },
  {
    title: "4. DATA & CONFIDENTIALITY",
    body: `4.1 Client Data: All documents uploaded by Client remain the property of Client. Provider processes data solely to deliver the Services. 4.2 Data Location: All Client data is stored in Supabase infrastructure within the EU (Frankfurt region) unless otherwise agreed in writing. 4.3 Confidentiality: Both parties shall protect each other's confidential information for three (3) years after termination. 4.4 Data Deletion: Upon termination, Provider shall delete all Client data within thirty (30) days and provide written confirmation. 4.5 Provider shall not use Client documents to train AI models without explicit written consent.`,
  },
  {
    title: "5. TERMINATION",
    body: `5.1 Either party may terminate for convenience with sixty (60) days written notice. 5.2 Either party may terminate immediately if the other party materially breaches this Agreement and fails to cure within fifteen (15) days of written notice. 5.3 Upon termination, Client shall pay all fees accrued through the termination date. Prepaid fees for unused months are non-refundable. 5.4 Sections 4 (Data and Confidentiality), 6 (Limitation of Liability), and 7 (Governing Law) survive termination.`,
  },
];

async function generate() {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (const pageContent of pages) {
    const page = pdfDoc.addPage([612, 792]);
    const { height } = page.getSize();
    const margin = 60;
    const maxWidth = 492;
    let y = height - margin;

    page.drawText(pageContent.title, {
      x: margin,
      y,
      size: 14,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 30;

    const words = pageContent.body.split(" ");
    let line = "";

    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, 11);

      if (width > maxWidth && line) {
        page.drawText(line, {
          x: margin,
          y,
          size: 11,
          font,
          color: rgb(0.15, 0.15, 0.15),
        });
        y -= 16;
        line = word;

        if (y < margin + 20) break;
      } else {
        line = testLine;
      }
    }

    if (line && y >= margin) {
      page.drawText(line, {
        x: margin,
        y,
        size: 11,
        font,
        color: rgb(0.15, 0.15, 0.15),
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  const outputPath = join(__dirname, "..", "public", "sample.pdf");
  writeFileSync(outputPath, pdfBytes);
  console.log(`Sample PDF written to ${outputPath} (${pages.length} pages)`);
}

generate().catch(console.error);
