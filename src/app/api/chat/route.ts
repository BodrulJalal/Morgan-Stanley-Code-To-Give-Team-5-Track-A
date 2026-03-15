import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim() : null;

    if (!message) {
      return NextResponse.json(
        { error: "Missing or invalid message field" },
        { status: 400 }
      );
    }

    const reply = `Zesty (placeholder): I received your message – "${message}". This is a demo response while the real AI is disabled.`;

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
