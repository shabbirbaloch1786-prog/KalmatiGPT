"use client";

import { FormEvent, useState } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  function speak(text: string) {
    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/[*#`_]/g, "")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.lang = "ur-PK";
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }

  async function sendMessage(e: FormEvent) {
    e.preventDefault();

    const text = message.trim();

    if (!text || loading) return;

    const updatedMessages: Message[] = [
      ...messages,
      {
        role: "user",
        text,
      },
    ];

    setMessages(updatedMessages);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.map((item) => ({
            role: item.role,
            content: item.text,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      const reply = data.reply || "AI ne koi jawab nahi diya.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: reply,
        },
      ]);

      speak(reply);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "❌ Kalmati GPT se jawab lene mein masla hua.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function newChat() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setMessages([]);
    setMessage("");
  }

  function stopSpeaking() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <header className="border-b border-gray-800 p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🤖 Kalmati GPT</h1>
          <p className="text-gray-400 text-sm">
            AI Assistant
          </p>
        </div>

        <button
          onClick={newChat}
          className="bg-gray-800 px-4 py-2 rounded-xl"
        >
          + New Chat
        </button>
      </header>

      <section className="flex-1 overflow-y-auto p-5">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && !loading && (
            <div className="text-center mt-20">
              <div className="text-6xl mb-5">🤖</div>

              <h2 className="text-3xl font-bold mb-3">
                Welcome to Kalmati GPT
              </h2>

              <p className="text-gray-400">
                Apna message likho aur AI se baat karo.
              </p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={
                msg.role === "user"
                  ? "flex justify-end"
                  : "flex justify-start"
              }
            >
              <div
                className={
                  msg.role === "user"
                    ? "bg-blue-600 rounded-2xl p-4 max-w-[85%]"
                    : "bg-gray-900 border border-gray-800 rounded-2xl p-4 max-w-[85%]"
                }
              >
                <p className="whitespace-pre-wrap">
                  {msg.text}
                </p>

                {msg.role === "assistant" && (
                  <div className="mt-3">
                    {speaking ? (
                      <button
                        onClick={stopSpeaking}
                        className="text-sm bg-red-600 px-3 py-2 rounded-lg"
                      >
                        🔇 Stop Voice
                      </button>
                    ) : (
                      <button
                        onClick={() => speak(msg.text)}
                        className="text-sm bg-gray-700 px-3 py-2 rounded-lg"
                      >
                        🔊 Listen
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-900 rounded-2xl p-4 text-gray-400">
                Kalmati GPT soch raha hai...
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="border-t border-gray-800 p-4">
        <form
          onSubmit={sendMessage}
          className="max-w-3xl mx-auto flex gap-2"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message Kalmati GPT..."
            disabled={loading}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl p-3 text-white"
          />

          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="bg-blue-600 px-5 rounded-xl disabled:opacity-40"
          >
            {loading ? "..." : "Send"}
          </button>
        </form>
      </div>
    </main>
  );
}
