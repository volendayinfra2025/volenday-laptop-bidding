import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const { newModelName, existingModels } = await request.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an IT hardware normalization assistant. Check if the 'newModelName' is just a variation of any of the 'existingModels' (e.g., 'Lenovo E480' is the same as 'Lenovo Thinkpad E480'). If it matches an existing one, return the exact existing string. If it is genuinely a new model, return the corrected, professional spelling of the new model. RETURN ONLY THE STRING, no quotes, no extra text.",
        },
        {
          role: "user",
          content: `newModelName: "${newModelName}"\nexistingModels: ${JSON.stringify(existingModels)}`,
        },
      ],
    });

    const normalized = response.choices[0].message?.content?.trim() ?? newModelName;
    return NextResponse.json({ normalized });
  } catch (error) {
    console.error("Normalization API Error:", error);
    return NextResponse.json({ error: "Failed to normalize model name." }, { status: 500 });
  }
}
