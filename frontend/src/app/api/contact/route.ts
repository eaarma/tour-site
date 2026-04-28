import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 },
      );
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

    if (!apiBaseUrl) {
      console.error(
        "Contact Form Error: NEXT_PUBLIC_API_BASE_URL is not configured",
      );

      return NextResponse.json(
        { error: "Contact service is not configured." },
        { status: 500 },
      );
    }

    const response = await fetch(`${apiBaseUrl}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        subject,
        message,
      }),
    });

    const data = (await response.json().catch(() => null)) as
      | { error?: string; success?: boolean }
      | null;

    return NextResponse.json(
      data ??
        (response.ok
          ? { success: true }
          : { error: "Failed to send message." }),
      { status: response.status },
    );
  } catch (error) {
    console.error("Contact Form Error: ", error);
    return NextResponse.json(
      { error: "Failed to send message." },
      { status: 500 },
    );
  }
}
