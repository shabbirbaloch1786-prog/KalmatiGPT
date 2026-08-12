import { GoogleGenAI } from "@google/genai";

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "GEMINI_API_KEY missing" },
        { status: 500 }
      );
    }

    const client = new GoogleGenAI({ apiKey });

    const token = await client.authTokens.create({
      config: {
        uses: 1,
        expireTime: new Date(
          Date.now() + 30 * 60 * 1000
        ).toISOString(),
        newSessionExpireTime: new Date(
          Date.now() + 60 * 1000
        ).toISOString(),
        liveConnectConstraints: {
          model: "gemini-2.5-flash-native-audio-preview-12-2025",
          config: {
            responseModalities: ["AUDIO" as any],
          },
        },
      },
    });

    return Response.json({
      token: token.name,
    });
  } catch (error) {
    console.error("LIVE TOKEN ERROR:", error);

    return Response.json(
      { error: "Live token create nahi hua" },
      { status: 500 }
    );
  }
}

