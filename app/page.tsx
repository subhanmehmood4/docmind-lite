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

const STEPS = [
  {
    step: "1",
    title: "Upload your PDF",
    description: "Contracts, policies, or reports — DocMind extracts and indexes every page in seconds.",
  },
  {
    step: "2",
    title: "Semantic indexing",
    description: "Phase 1 builds a searchable vector index so relevant passages surface instantly.",
  },
  {
    step: "3",
    title: "Ask with citations",
    description: "Phase 2 conversational Q&A returns answers with page-level proof you can verify.",
  },
];

const USE_CASES = [
  {
    title: "Contract review",
    description: "Find payment terms, liability clauses, and renewal dates without reading every page.",
  },
  {
    title: "Policy lookup",
    description: "HR and compliance teams query internal policies and get cited answers in seconds.",
  },
  {
    title: "Due diligence",
    description: "Review vendor agreements and investment docs faster with traceable source snippets.",
  },
];

export default function Home() {
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatKey, setChatKey] = useState(0);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLocalDev, setIsLocalDev] = useState(false);

  useEffect(() => {
    setIsLocalDev(
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    );
  }, []);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data: HealthStatus) => setHealth(data))
      .catch(() =>
        setHealth({
          ready: false,
          message: "Could not reach the server.",
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

      {isLocalDev && health && !health.ready && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 sm:px-6">
          <div className="mx-auto max-w-7xl text-sm text-amber-900">
            <span className="font-medium">Setup required.</span>{" "}
            Add your Groq + Hugging Face + Supabase keys to{" "}
            <code className="rounded bg-amber-100 px-1">.env.local</code> and restart the server.
          </div>
        </div>
      )}

      {!inWorkspace ? (
        <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
          <section className="mx-auto max-w-3xl text-center animate-slide-up">
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-600/10">
              Built for legal & compliance teams
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Stop digging through hundreds of pages
              <span className="text-indigo-600"> to find one clause.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Upload contracts and policies, ask questions in plain English, and get answers
              with page-level citations — built for teams that need accuracy, not guesses.
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
            {STEPS.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-600/10">
                  {item.step}
                </span>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </div>
            ))}
          </section>

          <section className="mt-16">
            <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-slate-400">
              Trusted workflows
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {USE_CASES.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"
                >
                  <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
            <div className="grid gap-0 lg:grid-cols-2">
              <div className="border-b border-slate-200 p-6 lg:border-b-0 lg:border-r">
                <p className="text-xs uppercase tracking-wide text-slate-400">Phase 1 · Indexed</p>
                <p className="mt-2 text-sm font-medium text-slate-900">24-page service agreement</p>
                <p className="mt-1 text-sm text-emerald-600">142 segments searchable</p>
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-wide text-slate-400">Phase 2 · Cited answer</p>
                <p className="mt-2 text-sm italic text-slate-700">
                  &ldquo;What are the payment terms?&rdquo;
                </p>
                <p className="mt-3 text-sm text-slate-500">
                  Net 30 from invoice date — cited from page 7, section 4.2.
                </p>
              </div>
            </div>
          </section>

          <footer className="mt-16 border-t border-slate-200 pt-8 text-center">
            <p className="text-xs text-slate-400">
              &copy; DocMind · Engineered by{" "}
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
