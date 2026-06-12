import CitationCard, { Citation } from "./CitationCard";
import { SparkIcon } from "./icons";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  isLoading?: boolean;
}

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm">
          <SparkIcon className="h-4 w-4" />
        </div>
      )}

      <div className={`max-w-[min(100%,680px)] space-y-3 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isUser
              ? "bg-indigo-600 text-white"
              : "border border-slate-200 bg-white text-slate-800"
          }`}
        >
          {message.isLoading ? (
            <div className="flex items-center gap-3 text-slate-500">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.2s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.1s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" />
              </div>
              <span className="text-sm">Analyzing document…</span>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Citations
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {message.citations.map((citation, index) => (
                <CitationCard
                  key={`${citation.page}-${index}`}
                  citation={citation}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
