import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const { prompt, laptop, laptops } = await request.json();

    const inventory = laptops.map((l: any) => 
      `- Model: ${l.modelType}. Specs: ${l.specs.cpu}, ${l.specs.ram}, ${l.specs.storage}. Defect: ${l.defectType}. Current Bid: ₱${l.currentBid}`
    ).join('\n');

    const systemMessage = `You are a highly analytical, warm, and helpful IT hardware specialist. The user is asking about THIS laptop:
    Model: ${laptop.modelType}
    Specs: ${laptop.specs.cpu}, ${laptop.specs.ram}, ${laptop.specs.storage}, ${laptop.specs.os}
    Defects: ${laptop.defectType} - ${laptop.description}
    Current Bid: ₱${laptop.currentBid}

    You also have access to the full inventory context here:
    ${inventory}

    CRITICAL INSTRUCTIONS:
    1. BE RATIONAL, BOLD, YET WARM: Give a definitive, honest opinion immediately, but explain your reasoning respectfully. Balance directness with a friendly tone. 
    2. CONCISE & REASONED: Maximum 3 to 4 short sentences total. Briefly weigh the pros and cons.
    3. NO MARKDOWN FORMATTING: Do NOT use asterisks, hashtags, or bullet points. Use plain text only.
    4. NO REPEATING SPECS: Do not list the specs. The user can see them. Focus strictly on the 'why' and your recommendation.
    5. Make smart, opinionated comparisons against the rest of the inventory if relevant.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
    });

    return NextResponse.json({ reply: response.choices[0].message?.content });
  } catch (error) {
    console.error("OpenAI Error:", error);
    return NextResponse.json({ error: "Failed to fetch response from AI." }, { status: 500 });
  }
}