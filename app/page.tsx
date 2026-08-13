"use client";

import { FormEvent, useEffect, useState } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

type Chat = {
  id: string;
  title: string;
  messages: Message[];
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [settings, setSettings] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("kalmati-gpt-chats");
      if (saved) setChats(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    if (chats.length) {
      localStorage.setItem("kalmati-gpt-chats", JSON.stringify(chats));
    }
  }, [chats]);

  function saveChat(nextMessages: Message[]) {
    if (!nextMessages.length) return;

    const firstUser = nextMessages.find((m) => m.role === "user");
    const title = firstUser?.text.slice(0, 30) || "New Chat";

    setChats((prev) => {
      const existing = prev[0];

      if (existing && existing.messages === messages) {
        return [
          {
            ...existing,
            title,
            messages: nextMessages,
          },
          ...prev.slice(1),
        ];
      }

      return [
        {
          id: Date.now().toString(),
          title,
          messages: nextMessages,
        },
        ...prev,
      ];
    });
  }

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

      const finalMessages: Message[] = [
        ...updatedMessages,
        { role: "assistant", text: reply },
      ];

      setMessages(finalMessages);
      saveChat(finalMessages);
    } catch {
      const errorMessages: Message[] = [
        ...updatedMessages,
        {
          role: "assistant",
          text: "Connection error. Dobara try karein.",
        },
      ];

      setMessages(errorMessages);
      saveChat(errorMessages);
    } finally {
      setLoading(false);
    }
  }

  function newChat() {
    setMessages([]);
    setMessage("");
    setSidebar(false);
  }

  function openChat(chat: Chat) {
    setMessages(chat.messages);
    setSidebar(false);
  }

  function clearHistory() {
    localStorage.removeItem("kalmati-gpt-chats");
    setChats([]);
  }

  return (
    <main className="min-h-screen bg-[#030712] text-white flex flex-col relative overflow-hidden">

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {sidebar && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setSidebar(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 bottom-0 w-72 z-50 bg-[#080d1d]/95 backdrop-blur-2xl border-r border-white/10 transform transition-transform duration-300 ${
          sidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="Kalmati GPT"
              className="w-10 h-10 rounded-xl"
            />
            <span className="font-bold">Kalmati GPT</span>
          </div>

          <button
            onClick={() => setSidebar(false)}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={newChat}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 font-semibold shadow-lg"
          >
            + New Chat
          </button>
        </div>

        <div className="px-3 pb-3 flex-1 overflow-y-auto">
          <p className="text-xs uppercase tracking-widest text-gray-500 px-2 py-3">
            Chat History
          </p>

          {chats.length === 0 ? (
            <p className="text-sm text-gray-500 px-2">
              Abhi koi saved chat nahi hai.
            </p>
          ) : (
            <div className="space-y-2">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => openChat(chat)}
                  className="w-full text-left rounded-xl px-3 py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition"
                >
                  <p className="text-sm truncate">{chat.title}</p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {chat.messages.length} messages
                  </p>
                </button>
              ))}
            </div>
          )}

          {chats.length > 0 && (
            <button
              onClick={clearHistory}
              className="w-full mt-5 text-sm text-red-400 hover:text-red-300 py-2"
            >
              🗑 Clear History
            </button>
          )}
        </div>
      </aside>

      {settings && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSettings(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1022] shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Settings</h2>
                <p className="text-sm text-gray-500 mt-1">Kalmati GPT</p>
              </div>

              <button
                onClick={() => setSettings(false)}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="font-semibold">🌐 Language</p>
                <p className="text-xs text-gray-500 mt-1">
                  Roman Urdu / English
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="font-semibold">🌙 Appearance</p>
                <p className="text-xs text-gray-500 mt-1">
                  Dark mode
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="font-semibold">🔊 Sound</p>
                <p className="text-xs text-gray-500 mt-1">
                  Voice features will be configured later.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="font-semibold">ℹ️ About</p>
                <p className="text-xs text-gray-500 mt-1">
                  Kalmati GPT — Intelligent AI Assistant
                </p>
              </div>
            </div>

            <button
              onClick={() => setSettings(false)}
              className="w-full mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3 font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <header className="relative z-10 border-b border-white/10 bg-[#070b1c]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebar(true)}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-lg"
            >
              ☰
            </button>

            <img
              src="/logo.svg"
              alt="Kalmati GPT"
              className="w-11 h-11 rounded-2xl shadow-lg"
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettings(true)}
              className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm"
            >
              ⚙️
            </button>

            <button
              onClick={newChat}
              className="hidden sm:block px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm"
            >
              + New Chat
            </button>
          </div>
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

                <div className="rounded-2xl border border-cyan-400/10 bg-white/[0.04] backdrop-blur p-5">
                  <div className="text-2xl mb-2">💡</div>
                  <p className="font-semibold">Ideas</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Create something new
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-400/10 bg-white/[0.04] backdrop-blur p-5">
                  <div className="text-2xl mb-2">🧠</div>
                  <p className="font-semibold">AI Assistant</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Ask anything
                  </p>
                </div>

                <div className="rounded-2xl border border-purple-400/10 bg-white/[0.04] backdrop-blur p-5">
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
                      <span className="text-xs text-cyan-300 font-bold">
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
                <div className="bg-white/[0.05] border border-white/10 backdrop-blur-xl rounded-3xl px-5 py-4">
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
