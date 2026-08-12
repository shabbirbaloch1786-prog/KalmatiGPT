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

  async function sendMessage(e: FormEvent) {
    e.preventDefault();

    const text = message.trim();

    if (!text || loading) return;

    const updatedMessages = [
      ...messages,
      { role: "user" as const, text },
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

      const reply =
        data.reply ||
        data.error ||
        "Kalmati GPT se response nahi mila.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: reply,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Connection error. Dobara try karein.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function newChat() {
    setMessages([]);
    setMessage("");
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white flex flex-col">

      {/* HEADER */}
      <header className="border-b border-white/10 bg-[#0d0d0d]/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xl shadow-lg">
              K
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-wide">
                Kalmati GPT
              </h1>

              <p className="text-xs text-gray-500">
                Intelligent AI Assistant
              </p>
            </div>
          </div>

          <button
            onClick={newChat}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm"
          >
            + New Chat
          </button>

        </div>
      </header>

      {/* CHAT AREA */}
      <section className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">

          {messages.length === 0 && (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">

              <div className="w-24 h-24 rounded-[30px] bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center text-5xl font-black shadow-2xl mb-7">
                K
              </div>

              <h2 className="text-4xl font-bold tracking-tight">
                Kalmati GPT
              </h2>

              <p className="mt-3 text-gray-400 max-w-md">
                Aapka personal AI assistant.
                Sawal poochhein, ideas share karein aur AI se baat karein.
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-2xl mb-2">💡</div>
                  <p className="text-sm text-gray-300">
                    Ideas
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-2xl mb-2">🧠</div>
                  <p className="text-sm text-gray-300">
                    AI Assistant
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-2xl mb-2">🚀</div>
                  <p className="text-sm text-gray-300">
                    Create
                  </p>
                </div>

              </div>
            </div>
          )}

          <div className="space-y-5">

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
                      ? "max-w-[85%] rounded-3xl rounded-br-md bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3.5 shadow-lg"
                      : "max-w-[85%] rounded-3xl rounded-bl-md bg-[#151515] border border-white/10 px-5 py-4 shadow-lg"
                  }
                >

                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xs font-bold">
                        K
                      </div>

                      <span className="text-xs text-cyan-400 font-semibold">
                        Kalmati GPT
                      </span>
                    </div>
                  )}

                  <p className="whitespace-pre-wrap leading-7 text-[15px]">
                    {msg.text}
                  </p>

                </div>

              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#151515] border border-white/10 rounded-3xl rounded-bl-md px-5 py-4">

                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />

                    <span className="text-sm text-gray-400 ml-2">
                      Kalmati GPT soch raha hai...
                    </span>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* INPUT */}
      <div className="border-t border-white/10 bg-[#0b0b0b]/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4">

          <form
            onSubmit={sendMessage}
            className="flex items-center gap-2 bg-[#151515] border border-white/10 rounded-2xl p-2 shadow-2xl"
          >

            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message Kalmati GPT..."
              disabled={loading}
              className="flex-1 bg-transparent px-4 py-3 outline-none text-white placeholder:text-gray-600"
            />

            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-lg font-bold disabled:opacity-30 transition"
            >
              ↑
            </button>

          </form>

          <p className="text-center text-[11px] text-gray-600 mt-3">
            Kalmati GPT can make mistakes. Check important information.
          </p>

        </div>
      </div>

    </main>
  );
}
