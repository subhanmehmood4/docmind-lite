import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DocMind — Document Intelligence for Legal Teams",
  description:
    "Upload contracts and policies, ask questions in plain English, and get answers with page-level citations powered by production RAG.",
  openGraph: {
    title: "DocMind — Document Intelligence for Legal Teams",
    description:
      "Stop digging through hundreds of pages. Semantic search and cited answers for legal and compliance workflows.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
