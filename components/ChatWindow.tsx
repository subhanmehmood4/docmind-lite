"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import MessageBubble, { ChatMessage } from "./MessageBubble";
import { SendIcon, SparkIcon } from "./icons";

interface ChatWindowProps {
  documentReady: boolean;
  documentName?: string;
}

const SUGGESTIONS = [
  "What is this document about?",
  "Summarize the key terms",
  "Who are the parties involved?",
  "What are the payment terms?",
];

export default function ChatWindow({ documentReady, documentName }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (documentReady) {
      inputRef.current?.focus();
    }
  }, [documentReady]);

  const sendQuestion = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || isSending || !documentReady) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    const loadingId = crypto.randomUUID();
    const loadingMessage: ChatMessage = {
      id: loadingId,
      role: "assistant",
      content: "",
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to get answer");
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? {
                id: loadingId,
                role: "assistant",
                content: data.answer,
                citations: data.citations,
              }
            : msg
        )
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? {
                id: loadingId,
                role: "assistant",
                content:
                  error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again.",
              }
            : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    sendQuestion(input);
  };

  if (!documentReady) {
    return (
      <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <SparkIcon />
        </div>
        <p className="mt-4 text-base font-medium text-slate-900">Your workspace is ready</p>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Upload a PDF on the left to unlock document chat with cited answers.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[calc(100vh-3.5rem)] flex-col bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-slate-900">Ask your document</p>
          <span className="rounded-full bg-cyan-500 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Phase 2
          </span>
        </div>
        {documentName && (
          <p className="mt-0.5 truncate text-xs text-slate-500">{documentName}</p>
        )}
      </div>

      <div className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-4 py-6 sm:px-6">
        {messages.length === 0 ? (
          <div className="mx-auto max-w-lg py-10 text-center animate-fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <SparkIcon />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Phase 2: Ask anything about this document
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Every answer includes page-level citations you can verify — not guesses from a generic chatbot.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => sendQuestion(suggestion)}
                  disabled={isSending}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => <MessageBubble key={message.id} message={message} />)
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-4 sm:p-5">
        <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 shadow-sm focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-500/10">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask a question about your document…"
            disabled={isSending}
            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
            <SendIcon />
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-slate-400">
          Answers are generated from your document context only.
        </p>
      </form>
    </div>
  );
}
