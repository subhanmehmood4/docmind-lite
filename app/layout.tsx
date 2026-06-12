import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DocMind — AI Document Q&A",
  description:
    "Upload a PDF and ask questions. Get accurate answers with source citations powered by RAG.",
  openGraph: {
    title: "DocMind — AI Document Q&A",
    description: "Professional document intelligence with cited answers.",
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
