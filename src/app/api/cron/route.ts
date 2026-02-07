import { NextResponse } from "next/server";

export async function GET() {
  try {
    const gatewayUrl =
      process.env.CLAWDBOT_GATEWAY_URL || "http://localhost:3210";
    const token = process.env.CLAWDBOT_TOKEN || "";

    const response = await fetch(`${gatewayUrl}/api/cron/list`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Gateway returned ${response.status}`);
    }

    const data = await response.json();

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
