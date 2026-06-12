"use client";

import { useCallback, useRef, useState } from "react";
import { FileIcon, UploadIcon } from "./icons";

interface UploadZoneProps {
  onUploadComplete: (info: { filename: string; chunks: number; pages: number }) => void;
  onUploadStart: () => void;
  onError: (message: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

const STEPS = ["Extracting text", "Creating embeddings", "Indexing document"];

export default function UploadZone({
  onUploadComplete,
  onUploadStart,
  onError,
  disabled = false,
  compact = false,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadingRef = useRef(false);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startStepAnimation = () => {
    setActiveStep(0);
    stepTimerRef.current = setInterval(() => {
      setActiveStep((step) => (step < STEPS.length - 1 ? step + 1 : step));
    }, 1400);
  };

  const stopStepAnimation = () => {
    if (stepTimerRef.current) {
      clearInterval(stepTimerRef.current);
      stepTimerRef.current = null;
    }
  };

  const uploadFile = useCallback(
    async (file: File) => {
      if (disabled || uploadingRef.current) return;

      uploadingRef.current = true;
      setIsProcessing(true);
      setFilename(file.name);
      startStepAnimation();
      onUploadStart();

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/ingest", {
          method: "POST",
          body: formData,
        });

        const contentType = response.headers.get("content-type") ?? "";
        const data = contentType.includes("application/json")
          ? await response.json()
          : { error: "Server error while processing PDF. Restart the dev server and try again." };

        if (!response.ok) {
          throw new Error(data.error ?? "Upload failed");
        }

        onUploadComplete({
          filename: data.filename,
          chunks: data.chunks,
          pages: data.pages,
        });
      } catch (error) {
        setFilename(null);
        onError(error instanceof Error ? error.message : "Upload failed");
      } finally {
        stopStepAnimation();
        uploadingRef.current = false;
        setIsProcessing(false);
      }
    },
    [disabled, onError, onUploadComplete, onUploadStart]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleSample = useCallback(async () => {
    if (disabled || uploadingRef.current) return;

    try {
      const response = await fetch("/sample.pdf");
      if (!response.ok) throw new Error("Could not load sample PDF");

      const blob = await response.blob();
      const file = new File([blob], "sample-service-agreement.pdf", {
        type: "application/pdf",
      });
      await uploadFile(file);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Sample load failed");
    }
  }, [disabled, onError, uploadFile]);

  return (
    <div className={`space-y-3 ${compact ? "" : "animate-slide-up"}`}>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && !isProcessing && inputRef.current?.click()}
        className={`group relative cursor-pointer overflow-hidden rounded-2xl border bg-white transition-all ${
          isDragging
            ? "border-indigo-400 shadow-card ring-4 ring-indigo-500/10"
            : "border-slate-200 shadow-soft hover:border-indigo-300 hover:shadow-card"
        } ${disabled || isProcessing ? "pointer-events-none opacity-60" : ""} ${
          compact ? "p-8" : "p-12"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          disabled={disabled || isProcessing}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) uploadFile(file);
            event.target.value = "";
          }}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-5 py-2 text-center">
            <div className="relative flex h-14 w-14 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-indigo-100 opacity-60" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <FileIcon className="h-6 w-6" />
              </div>
            </div>
            <div>
              <p className="text-base font-medium text-slate-900">
                Processing {filename ?? "document"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                This usually takes a few seconds
              </p>
            </div>
            <div className="w-full max-w-xs space-y-2">
              {STEPS.map((step, index) => (
                <div
                  key={step}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition ${
                    index <= activeStep
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-400"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      index <= activeStep ? "bg-indigo-500" : "bg-slate-300"
                    }`}
                  />
                  {step}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition group-hover:scale-105 group-hover:bg-indigo-100">
              <UploadIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">
                Drop your PDF here, or browse
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Supports text-based PDFs up to 10MB and 20 pages
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              PDF only
            </span>
          </div>
        )}
      </div>

      {!isProcessing && (
        <button
          type="button"
          onClick={handleSample}
          disabled={disabled}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700 disabled:opacity-50"
        >
          Try sample contract PDF
        </button>
      )}
    </div>
  );
}
