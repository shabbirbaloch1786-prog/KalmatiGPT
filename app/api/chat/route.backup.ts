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

    const messages: ChatMessage[] = Array.isArray(body.messages)
      ? body.messages
      : body.message
        ? [{ role: "user", content: body.message }]
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
            "You are Kalmati GPT. Reply in Roman Urdu by default. If the user writes in English, reply in English. Never reply in Hindi unless the user explicitly asks for Hindi. Keep answers natural, clear, helpful, and professional.",
        },
        ...messages,
      ],
    });

    const reply = completion.choices[0]?.message?.content;

    return Response.json({
      reply: reply || "AI se jawab nahi mila.",
    });
  } catch (error) {
    console.error("Chat API error:", error);

    return Response.json(
      { error: "AI se jawab lene mein masla hua." },
      { status: 500 }
    );
  }
}

