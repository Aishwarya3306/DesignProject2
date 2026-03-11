import { NextResponse } from 'next/server';

const LANGUAGE_MAP: Record<string, string> = {
    "en": "English",
    "hi": "Hindi",
    "kn": "Kannada",
    "te": "Telugu",
    "ta": "Tamil"
};

const SYSTEM_PROMPT = `You are ArogyaAI, a supportive health assistant.
Respond strictly in the following language: {language}.`;

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, language = "english" } = body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.error("Warning: GROQ_API_KEY not found in environment.");
      return NextResponse.json({ error: "API key misconfiguration: GROQ_API_KEY is missing in your frontend environment." }, { status: 500 });
    }

    const lang_name = LANGUAGE_MAP[language] || language;
    const sys_prompt = SYSTEM_PROMPT.replace("{language}", lang_name);

    let response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // We can use llama-3.1-8b-instant as fallback if this fails
        messages: [
          { role: "system", content: sys_prompt },
          { role: "user", content: message }
        ],
        temperature: 0.5,
        max_tokens: 1024,
      }),
    });

    let data = await response.json();
    
    // Fallback if llama3-8b-8192 is decommissioned or not found
    if (!response.ok && data.error?.message && (data.error.message.includes("decommissioned") || data.error.message.includes("not found"))) {
      response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: sys_prompt },
            { role: "user", content: message }
          ],
          temperature: 0.5,
          max_tokens: 1024,
        }),
      });
      data = await response.json();
    }

    if (!response.ok) {
      console.error("Groq API Error:", data);
      return NextResponse.json({ error: data.error?.message || "Failed to fetch from AI provider" }, { status: 500 });
    }

    let reply = data.choices[0].message.content;
    const disclaimer = "This is not a medical diagnosis. Please consult a healthcare professional for proper medical advice.";
    
    // Defensive check to ensure the disclaimer is present
    if (!reply.includes(disclaimer)) {
        reply += `\n\nDisclaimer:\n${disclaimer}`;
    }

    return NextResponse.json({ response: reply });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "AI service is temporarily unavailable. Here is some basic advice:\n- Stay hydrated and drink plenty of water.\n- Get adequate rest to help your body recover.\n- Maintain a balanced diet.\n\nDisclaimer:\nThis is not a medical diagnosis. Please consult a healthcare professional for proper medical advice." },
      { status: 503 }
    );
  }
}
