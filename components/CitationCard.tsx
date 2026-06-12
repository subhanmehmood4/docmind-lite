export interface Citation {
  content: string;
  page: number;
  similarity?: number;
}

interface CitationCardProps {
  citation: Citation;
  index: number;
}

function truncate(text: string, maxLength = 160): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}

export default function CitationCard({ citation, index }: CitationCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
          Source {index + 1}
        </span>
        <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200">
          Page {citation.page}
        </span>
      </div>
      <p className="text-xs leading-relaxed text-slate-600">
        &ldquo;{truncate(citation.content)}&rdquo;
      </p>
    </div>
  );
}
