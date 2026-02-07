import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Use clawdbot CLI directly
    const { stdout } = await execAsync(
      'clawdbot cron list --all --json'
    );
    
    const data = JSON.parse(stdout);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching cron jobs:", message);
    return NextResponse.json(
      { error: "Failed to fetch cron jobs", details: message },
      { status: 500 }
    );
  }
}
