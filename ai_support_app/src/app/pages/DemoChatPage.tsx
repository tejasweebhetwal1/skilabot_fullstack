import { useState } from "react";
import { useNavigate } from "react-router";
import { Bot, Send, X } from "lucide-react";

type Message = {
  role: "user" | "bot";
  text: string;
};

function demoReply(text: string) {
  const lower = text.toLowerCase();

  if (lower.includes("price") || lower.includes("pricing")) {
    return "Our Basic plan is $29.99/month and Premium is $59.99/month. Please log in to start using the full bot.";
  }

  if (lower.includes("hello") || lower.includes("hi")) {
    return "Hi! I’m ClariBot. I can answer customer questions, explain pricing, and help with support.";
  }

  if (lower.includes("feature")) {
    return "ClariBot supports AI replies, customer insights, analytics, multilingual support, and team collaboration.";
  }

  return "Thanks for your message. This is demo mode, so you can try a few messages before logging in.";
}

export default function DemoChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hi! I’m ClariBot. You can try the demo chat 4 times before logging in.",
    },
  ]);
  const [input, setInput] = useState("");
  const [count, setCount] = useState(0);
  const [showLimit, setShowLimit] = useState(false);

  function sendMessage() {
    const text = input.trim();
    if (!text) return;

    if (count >= 4) {
      setShowLimit(true);
      return;
    }

    const newCount = count + 1;
    setCount(newCount);

    setMessages((prev) => [
      ...prev,
      { role: "user", text },
      { role: "bot", text: demoReply(text) },
    ]);

    setInput("");

    if (newCount >= 4) {
      setTimeout(() => setShowLimit(true), 500);
    }
  }

  return (
    <div className="min-h-screen bg-[#fef0f5] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white">
          <div className="flex items-center gap-3">
            <Bot />
            <div>
              <h1 className="font-bold">ClariBot Demo Chat</h1>
              <p className="text-xs text-white/80">{4 - count} free demo messages left</p>
            </div>
          </div>

          <button onClick={() => navigate("/")}>
            <X />
          </button>
        </div>

        <div className="h-[450px] overflow-y-auto p-6 space-y-4 bg-[#fff9fb]">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-[#bd5b96] text-white"
                    : "bg-white text-gray-800 shadow"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 p-4 border-t">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Type your demo message..."
            className="flex-1 rounded-xl border px-4 py-3 outline-none"
          />

          <button
            onClick={sendMessage}
            className="rounded-xl bg-[#bd5b96] px-5 text-white"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {showLimit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-2xl">
            <h2 className="text-2xl font-bold mb-3">Demo limit reached</h2>
            <p className="text-gray-600 mb-6">
              You used your 4 free demo messages. Please log in or create an account to continue using ClariBot.
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate("/login")}
                className="rounded-xl bg-[#bd5b96] px-6 py-3 text-white"
              >
                Login / Sign Up
              </button>

              <button
                onClick={() => navigate("/")}
                className="rounded-xl border px-6 py-3"
              >
                Back Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}