import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return Response.json(
        { error: "Invalid request." },
        { status: 400 }
      );
    }

    const messages: ChatMessage[] = Array.isArray(body.messages)
      ? body.messages
      : body.message
        ? [{ role: "user", content: String(body.message) }]
        : [];

    if (messages.length === 0) {
      return Response.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const completion = await client.chat.completions.create({
      model: "deepseek/deepseek-chat-v3.1",
      messages: [
        {
          role: "system",
          content:
            "You are Kalmati GPT. Reply in Roman Urdu by default. If the user writes in English, reply in English. Never reply in Hindi unless explicitly requested. Be helpful, clear, professional, and safe.",
        },
        ...messages,
      ],
    });

    const reply = completion.choices[0]?.message?.content;

    if (!reply) {
      return Response.json(
        { error: "AI ne koi jawab nahi diya." },
        { status: 502 }
      );
    }

    return Response.json({ reply });
  } catch (error) {
    console.error("Kalmati GPT API Error:", error);

    return Response.json(
      {
        error:
          "Kalmati GPT se connection mein masla hua. Dobara try karein.",
      },
      { status: 500 }
    );
  }
}

