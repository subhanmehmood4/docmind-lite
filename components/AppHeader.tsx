import { LogoMark } from "./icons";

interface AppHeaderProps {
  documentName?: string;
  onNewDocument?: () => void;
  showNewDocument?: boolean;
}

export default function AppHeader({
  documentName,
  onNewDocument,
  showNewDocument = false,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <LogoMark className="h-8 w-8 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight text-slate-900">DocMind</p>
            {documentName ? (
              <p className="truncate text-xs text-slate-500">{documentName}</p>
            ) : (
              <p className="text-xs text-slate-500">Document intelligence</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showNewDocument && onNewDocument && (
            <button
              type="button"
              onClick={onNewDocument}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              New document
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
