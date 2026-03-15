import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `Jesteś asystentem planowania w aplikacji produktywności LEVEL.
Użytkownik poda Ci cel kwartalny. Twoim zadaniem jest rozłożyć go na 5-7 konkretnych, wykonalnych kroków.

Zasady:
- Każdy krok powinien być jednym, jasnym zadaniem
- Kroki powinny być w logicznej kolejności
- Każdy krok powinien mieć oszacowaną trudność: quick (5min), easy (15min), medium (1h), hard (3h), epic (3h+)
- Odpowiedź w formacie JSON array

Zwróć TYLKO JSON bez dodatkowego tekstu:
[
  { "title": "Nazwa kroku", "difficulty": "medium" },
  ...
]`;

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check user level >= 7
  const { data: profile } = await supabase
    .from("users")
    .select("level")
    .eq("id", user.id)
    .single();

  if (!profile || profile.level < 7) {
    return NextResponse.json(
      { error: "Feature unlocked at Level 7" },
      { status: 403 }
    );
  }

  const { title, description } = await request.json();

  if (!title) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI service not configured" },
      { status: 503 }
    );
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Cel: ${title}${description ? `\nOpis: ${description}` : ""}`,
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "[]";

    // Parse the JSON response
    const steps = JSON.parse(text);

    return NextResponse.json({ steps });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate breakdown" },
      { status: 500 }
    );
  }
}
