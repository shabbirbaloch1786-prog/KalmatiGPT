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

    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", text },
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
        { role: "assistant", text: reply },
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
    <main className="min-h-screen bg-[#030712] text-white flex flex-col relative overflow-hidden">

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-[#070b1c]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="Kalmati GPT"
              className="w-12 h-12 rounded-2xl shadow-lg"
            />

            <div>
              <h1 className="text-xl font-extrabold tracking-wide">
                Kalmati GPT
              </h1>
              <p className="text-xs text-cyan-300">
                Intelligent AI Assistant
              </p>
            </div>
          </div>

          <button
            onClick={newChat}
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm"
          >
            + New Chat
          </button>

        </div>
      </header>

      <section className="relative z-10 flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">

          {messages.length === 0 && !loading && (
            <div className="min-h-[65vh] flex flex-col items-center justify-center text-center">

              <img
                src="/logo.svg"
                alt="Kalmati GPT"
                className="w-28 h-28 rounded-[32px] shadow-2xl mb-7"
              />

              <h2 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
                Kalmati GPT
              </h2>

              <p className="mt-4 text-gray-400 max-w-md leading-7">
                Your intelligent AI assistant.
                Ask questions, create ideas and start a conversation.
              </p>

              <div className="mt-9 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">

                <div className="rounded-2xl border border-cyan-400/10 bg-white/[0.04] backdrop-blur p-5 hover:bg-white/[0.07] transition">
                  <div className="text-2xl mb-2">💡</div>
                  <p className="font-semibold">Ideas</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Create something new
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-400/10 bg-white/[0.04] backdrop-blur p-5 hover:bg-white/[0.07] transition">
                  <div className="text-2xl mb-2">🧠</div>
                  <p className="font-semibold">AI Assistant</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Ask anything
                  </p>
                </div>

                <div className="rounded-2xl border border-purple-400/10 bg-white/[0.04] backdrop-blur p-5 hover:bg-white/[0.07] transition">
                  <div className="text-2xl mb-2">🚀</div>
                  <p className="font-semibold">Create</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Turn ideas into reality
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
                      ? "max-w-[88%] rounded-3xl rounded-br-md bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-4 shadow-xl"
                      : "max-w-[88%] rounded-3xl rounded-bl-md bg-white/[0.05] border border-white/10 backdrop-blur-xl px-5 py-4 shadow-xl"
                  }
                >

                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-3">
                      <img
                        src="/logo.svg"
                        alt=""
                        className="w-7 h-7 rounded-lg"
                      />
                      <span className="text-xs text-cyan-300 font-bold tracking-wide">
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
                <div className="bg-white/[0.05] border border-white/10 backdrop-blur-xl rounded-3xl rounded-bl-md px-5 py-4">

                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />

                    <span className="text-sm text-gray-400 ml-2">
                      Kalmati GPT is thinking...
                    </span>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      <div className="relative z-10 border-t border-white/10 bg-[#070b1c]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4">

          <form
            onSubmit={sendMessage}
            className="flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl"
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
              className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-lg font-bold disabled:opacity-30 transition shadow-lg"
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
