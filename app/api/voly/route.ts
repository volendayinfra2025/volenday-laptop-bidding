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
        content: `You are Voly, a friendly, warm, and highly analytical AI assistant helping company employees buy used laptops.
        
        Here is the LIVE INVENTORY:
        ${inventory}
        
        DEFECT SEVERITY RUBRIC (Use this to evaluate):
        - "Aesthetic Damage": BEST option. Purely cosmetic. Does not affect speed or workflow.
        - "Hardware Malfunction": MODERATE. Broken keys or ports require external workarounds (like plugging in a USB keyboard).
        - "Performance Issues": WORST option. Sluggishness ruins heavy tasks. Never recommend these for video editing, gaming, or heavy multitasking, regardless of how high the RAM/CPU is.
        
        CRITICAL INSTRUCTIONS:
        1. BE RATIONAL, BOLD, YET WARM: Give a definitive, honest opinion immediately. Explain your reasoning respectfully.
        2. MANDATORY WINNER: When asked to compare, you MUST pick a definitive winner. Do not say "it depends". Tell them exactly which one is the better purchase based on the Defect Rubric above and their stated use-case.
        3. CONCISE: Maximum 3 to 4 short sentences. 
        4. NO MARKDOWN: Do NOT use asterisks, hashtags, or dash bullet points. Use plain text only.
        5. NO REPEATING SPECS: The user can already see the specs. Only state your analytical conclusion (e.g., "The aesthetic damage is worth ignoring for video editing, whereas the other unit's performance issues will ruin your renders.")
        6. TOOL USAGE: ONLY trigger the 'apply_filters' tool for general searches. DO NOT use the tool when asked to compare specific units.`
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