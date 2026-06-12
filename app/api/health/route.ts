import { NextResponse } from "next/server";
import { getEnvStatus, isFullyConfigured } from "@/lib/env";

export const runtime = "nodejs";

export async function GET() {
  const status = getEnvStatus();

  return NextResponse.json({
    ready: isFullyConfigured(),
    services: status,
    message: isFullyConfigured()
      ? "All services configured."
      : "Missing environment variables. Copy .env.example to .env.local and add your API keys.",
  });
}
