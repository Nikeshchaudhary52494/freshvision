import { NextRequest, NextResponse } from "next/server";

type GeminiResponse = {
  error?: {
    message?: string;
  };
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

function extractJsonFromText(text: string) {
  const trimmed = text.trim();

  // Handle common markdown fenced responses such as ```json ... ```
  const withoutFences = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/, "")
    .trim();

  try {
    return JSON.parse(withoutFences);
  } catch {
    const start = withoutFences.indexOf("{");
    const end = withoutFences.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      throw new Error("No JSON object found in model response");
    }

    return JSON.parse(withoutFences.slice(start, end + 1));
  }
}

export async function POST(req: NextRequest) {
  const requestBody = await req.json();
  const image = requestBody?.image;

  if (!image || typeof image !== "string" || !image.includes(",")) {
    return NextResponse.json(
      {
        name: null,
        grade: "D",
        description: "Invalid image payload",
        useCase: "Upload or capture a valid image",
      },
      { status: 400 },
    );
  }

  const apiKeys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  if (apiKeys.length === 0) {
    console.error("[analyze] No Gemini API keys configured");
    return NextResponse.json(
      {
        name: null,
        grade: "D",
        description: "Server config error: missing Gemini keys",
        useCase: "Set GEMINI_API_KEYS in .env",
      },
      { status: 500 },
    );
  }

  const base64 = image.split(",")[1];
  const model = process.env.GEMINI_MODEL ?? "gemini-3-flash-preview";

  const prompt = `
You are a fruit and vegetable quality inspector.

Analyze the image and respond STRICTLY in JSON format:

{
  "name": "fruit/vegetable name OR null",
  "grade": "A | B | C | D",
  "description": "short visual description",
  "useCase": "best usage suggestion"
}

Rules:
- If no fruit/vegetable → return:
  { "name": null, "grade": "D", "description": "No fresh produce detected", "useCase": "N/A" }

- Grade system:
  A = perfect
  B = minor defects
  C = overripe but usable
  D = spoiled

- Add smart use cases:
  Overripe → smoothie, baking
  Spoiled → compost, fermentation
  Raw/unripe → store in warm place

Respond ONLY JSON.
`;

  let lastError = null;

  for (let i = 0; i < apiKeys.length; i++) {
    const key = apiKeys[i];
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: "image/jpeg",
                      data: base64,
                    },
                  },
                ],
              },
            ],
          }),
        },
      );

      const raw = await res.text();
      let data: GeminiResponse;

      try {
        data = JSON.parse(raw);
      } catch {
        console.error(`[analyze] Non-JSON Gemini response (Key Index: ${i})`, {
          status: res.status,
          body: raw.slice(0, 500),
        });
        continue; // Try next key
      }

      if (!res.ok) {
        console.error(`[analyze] Gemini API error (Key Index: ${i})`, {
          status: res.status,
          error: data?.error,
        });
        lastError = data?.error?.message || "AI service error";
        continue; // Try next key
      }

      // Success!
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text || typeof text !== "string") throw new Error("Empty model response");

      const json = extractJsonFromText(text);
      return NextResponse.json(json);
    } catch (err) {
      console.error(`[analyze] Attempt failed (Key Index: ${i})`, err);
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  // If we reach here, all keys failed
  return NextResponse.json(
    {
      name: null,
      grade: "D",
      description: lastError || "All AI service keys exhausted or failed",
      useCase: "Retry in a few seconds",
    },
    { status: 502 },
  );
}

