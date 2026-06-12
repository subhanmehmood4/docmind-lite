"use client";

import { useCallback, useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import ChatWindow from "@/components/ChatWindow";
import DocumentSidebar from "@/components/DocumentSidebar";
import UploadZone from "@/components/UploadZone";

interface DocumentInfo {
  filename: string;
  chunks: number;
  pages: number;
}

interface HealthStatus {
  ready: boolean;
  message: string;
}

const LANDING_FEATURES = [
  {
    title: "Upload any PDF",
    description: "Drop contracts, reports, or manuals. DocMind extracts and indexes the content instantly.",
  },
  {
    title: "Ask in plain English",
    description: "No keyword search. Just ask questions the way you would to a colleague.",
  },
  {
    title: "Answers with proof",
    description: "Every response cites the exact page and passage it came from.",
  },
];

export default function Home() {
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatKey, setChatKey] = useState(0);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data: HealthStatus) => setHealth(data))
      .catch(() =>
        setHealth({
          ready: false,
          message: "Could not reach the server. Run npm run dev inside docmind-lite.",
        })
      );
  }, []);

  const handleUploadStart = () => {
    setError(null);
    setDocumentInfo(null);
  };

  const handleUploadComplete = (info: DocumentInfo) => {
    setDocumentInfo(info);
    setChatKey((key) => key + 1);
  };

  const handleError = useCallback((message: string) => {
    setError(message);
  }, []);

  const handleNewDocument = () => {
    setDocumentInfo(null);
    setError(null);
    setChatKey((key) => key + 1);
  };

  const isConfigured = health?.ready ?? true;
  const inWorkspace = !!documentInfo;

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader
        documentName={documentInfo?.filename}
        showNewDocument={inWorkspace}
        onNewDocument={handleNewDocument}
      />

      {health && !health.ready && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 sm:px-6">
          <div className="mx-auto max-w-7xl text-sm text-amber-900">
            <span className="font-medium">Setup required.</span>{" "}
            Add your Gemini + Supabase keys to <code className="rounded bg-amber-100 px-1">.env.local</code>{" "}
            and restart the server.
          </div>
        </div>
      )}

      {!inWorkspace ? (
        <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
          <section className="mx-auto max-w-3xl text-center animate-slide-up">
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-600/10">
              AI document intelligence
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Turn any PDF into a
              <span className="text-indigo-600"> searchable conversation</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              DocMind reads your document, finds the relevant sections, and answers your
              questions with cited sources — built for teams that need accuracy, not guesses.
            </p>
          </section>

          <section className="mx-auto mt-10 max-w-xl">
            <UploadZone
              onUploadStart={handleUploadStart}
              onUploadComplete={handleUploadComplete}
              onError={handleError}
              disabled={!isConfigured}
            />

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </section>

          <section className="mt-16 grid gap-4 sm:grid-cols-3">
            {LANDING_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"
              >
                <h3 className="text-sm font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </section>

          <footer className="mt-16 border-t border-slate-200 pt-8 text-center">
            <p className="text-xs text-slate-400">
              Demo product by{" "}
              <a
                href="https://devaxon.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-slate-500 transition hover:text-indigo-600"
              >
                DevAxon
              </a>
            </p>
          </footer>
        </main>
      ) : (
        <main className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-7xl animate-fade-in">
          <div className="hidden w-72 shrink-0 lg:block">
            <DocumentSidebar
              filename={documentInfo.filename}
              pages={documentInfo.pages}
              chunks={documentInfo.chunks}
            />
          </div>

          <div className="min-w-0 flex-1 border-x border-slate-200 bg-white">
            {error && (
              <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <ChatWindow
              key={chatKey}
              documentReady
              documentName={documentInfo.filename}
            />
          </div>
        </main>
      )}
    </div>
  );
}
