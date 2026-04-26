import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { image } = await req.json();

  const base64 = image.split(",")[1];

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

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64,
                },
              },
            ],
          },
        ],
      }),
    }
  );

  const data = await res.json();

  try {
    const text = data.candidates[0].content.parts[0].text;
    const json = JSON.parse(text);
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({
      name: null,
      grade: "D",
      description: "AI parsing failed",
      useCase: "Retry",
    });
  }
}