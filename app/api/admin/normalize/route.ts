import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { newModelName, existingModels } = await request.json();

    const input = newModelName.trim().toLowerCase();
    for (const existing of existingModels) {
      const target = existing.toLowerCase();
      if (target === input || target.includes(input) || input.includes(target)) {
        return NextResponse.json({ normalized: existing });
      }
    }

    const corrected = newModelName.trim().replace(/\s+/g, ' ');
    return NextResponse.json({ normalized: corrected });
  } catch (error) {
    console.error("Normalization Error:", error);
    return NextResponse.json({ normalized: null });
  }
}
