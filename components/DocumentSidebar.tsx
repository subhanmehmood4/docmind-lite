import { CheckIcon, FileIcon } from "./icons";
import { WORKSPACE_ENV, WORKSPACE_NAME } from "@/lib/constants";

interface DocumentSidebarProps {
  filename: string;
  pages: number;
  chunks: number;
}

const FEATURES = [
  "Semantic search across every page",
  "Answers grounded in your PDF only",
  "Source citations on every response",
];

export default function DocumentSidebar({ filename, pages, chunks }: DocumentSidebarProps) {
  return (
    <aside className="flex h-full flex-col border-r border-slate-200 bg-slate-50/80 p-5">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <FileIcon />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">{filename}</p>
            <p className="mt-1 text-xs text-slate-500">
              {pages} pages indexed · {chunks} segments
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
          <CheckIcon className="h-3.5 w-3.5" />
          Indexed and ready
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          How it works
        </p>
        <ul className="mt-3 space-y-3">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex gap-2 text-sm text-slate-600">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto space-y-3">
        <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 p-4">
          <p className="text-xs leading-relaxed text-slate-500">
            DocMind retrieves relevant passages before generating each answer — keeping
            responses traceable and reducing hallucinations.
          </p>
        </div>
        <p className="text-xs text-slate-400">
          {WORKSPACE_NAME} · {WORKSPACE_ENV}
        </p>
      </div>
    </aside>
  );
}
