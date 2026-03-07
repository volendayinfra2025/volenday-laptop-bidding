import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const { prompt, history, laptops } = await request.json();

    const inventory = laptops.map((l: any) => 
      `- Model: ${l.modelType} (S/N: ${l.serialNumber}). Specs: ${l.specs.cpu}, ${l.specs.ram}, ${l.specs.storage}. Defect: ${l.defectType} (${l.description}). Current Bid: ₱${l.currentBid}`
    ).join('\n');

    const messages = [
      {
        role: "system",
        content: `You are Voly, a friendly, warm, and highly capable AI robot assistant helping company employees find the perfect used laptop in an internal auction.
        
        Here is the LIVE INVENTORY:
        ${inventory}
        
        CRITICAL INSTRUCTIONS:
        1. BE RATIONAL, BOLD, YET WARM: Give a definitive, honest opinion immediately, but explain your reasoning respectfully. Balance your directness with a helpful, friendly tone.
        2. CONCISE & REASONED: Keep your response to a maximum of 3 to 4 short sentences. Briefly weigh the pros and cons (e.g., price vs. defect severity) to justify your recommendation.
        3. NO MARKDOWN: Do NOT use asterisks for bolding, hashtags for headings, or dash bullet points. Use plain text only.
        4. NO REPEATING SPECS: The user can already see the specs. Only state your analytical conclusion (e.g., "The extra storage is great, but the keyboard defect might slow you down too much.")
        5. TOOL USAGE: ONLY trigger the 'apply_filters' tool for general searches (e.g., "cheap laptops"). DO NOT use the tool when asked to compare specific units.`
      },
      ...history.map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: prompt }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages as any,
      tools: [
        {
          type: "function",
          function: {
            name: "apply_filters",
            description: "Update the user's screen to filter the laptops grid based on their request.",
            parameters: {
              type: "object",
              properties: {
                models: { type: "array", items: { type: "string" } },
                defects: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      ]
    });

    const msg = response.choices[0].message;
    let reply = msg.content || "";
    let filters = null;

    if (msg.tool_calls && msg.tool_calls.length > 0) {
      const toolCall = msg.tool_calls[0] as any;
      if (toolCall.function.name === 'apply_filters') {
        filters = JSON.parse(toolCall.function.arguments || "{}");
        if (!reply) {
          reply = "I've applied those filters for you! Take a look at the units on the right.";
        }
      }
    }

    return NextResponse.json({ reply, filters });
  } catch (error) {
    console.error("OpenAI Error:", error);
    return NextResponse.json({ error: "Failed to fetch response." }, { status: 500 });
  }
}