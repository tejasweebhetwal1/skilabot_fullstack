import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { api, getToken, clearSession, type ApiConversation } from "../lib/api";
import {
  Bot, Send, Plus, Search, MoreHorizontal, Trash2, Edit3, ThumbsUp, ThumbsDown,
  Copy, RefreshCw, Paperclip, Smile, Mic, MicOff, X, MessageSquare, Sparkles,
  CheckCheck, LogOut, Download, StopCircle,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  id: number | string;
  role: "user" | "bot";
  text: string;
  time: string;
  liked?: boolean | null;
}

interface Conversation {
  id: number | string;
  title: string;
  preview: string;
  time: string;
  unread?: number;
  isApi?: boolean;
}

// ── Fallback replies (used when backend is offline) ───────────────────────────

const BOT_RESPONSES: Record<string, string> = {
  default: "Thanks for reaching out! I'd be happy to help. Could you share a bit more detail so I can give you the most accurate answer?",
  billing: "I can see your account details right here. Your latest invoice #4421 was generated on June 20, 2026 for $99. I can resend it to your registered email — want me to do that?",
  plan: "The **Growth plan** at $99/mo includes 20,000 conversations per month, 5 channel integrations, advanced analytics, human handoff, and priority support. Would you like to upgrade?",
  slack: "Connecting Slack takes about 2 minutes! Go to **Settings → Integrations → Slack**, click Connect, and authorise ClariBot in your Slack workspace. Need a step-by-step walkthrough?",
  export: "Yes! You can export your full chat history as CSV or JSON. Head to **Settings → Data → Export Conversations**. You'll receive a download link by email within minutes.",
  training: "ClariBot learns from every conversation automatically. You can also upload documents in **Settings → AI Training → Knowledge Base**. Changes take effect within 15 minutes.",
};

function getBotReply(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("billing") || lower.includes("invoice") || lower.includes("payment")) return BOT_RESPONSES.billing;
  if (lower.includes("plan") || lower.includes("growth") || lower.includes("pricing")) return BOT_RESPONSES.plan;
  if (lower.includes("slack") || lower.includes("connect") || lower.includes("integration")) return BOT_RESPONSES.slack;
  if (lower.includes("export") || lower.includes("history") || lower.includes("download")) return BOT_RESPONSES.export;
  if (lower.includes("train") || lower.includes("ai") || lower.includes("learn")) return BOT_RESPONSES.training;
  return BOT_RESPONSES.default;
}

const QUICK_REPLIES = [
  "What's included in the Growth plan?",
  "How do I connect Slack?",
  "Can I export my chat history?",
  "How does AI training work?",
];

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function toUiMessages(conv: ApiConversation): Message[] {
  return conv.messages.map(m => ({
    id: m.id, role: m.role, text: m.text,
    time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }));
}

// ── Message Bubble ────────────────────────────────────────────────────────────

function Bubble({ msg, onLike }: { msg: Message; onLike: (id: number | string, v: boolean) => void }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(msg.text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const isBot = msg.role === "bot";

  return (
    <div className={`flex gap-3 group ${isBot ? "justify-start" : "justify-end"}`}>
      {isBot && (
        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1" style={{ background: "linear-gradient(135deg,#7c3aed,#9d5cf5)" }}>
          <Bot size={15} color="#fff" />
        </div>
      )}
      <div className="max-w-[72%] flex flex-col gap-1">
        <div
          className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
          style={
            isBot
              ? { background: "#fff", color: "#12082a", borderBottomLeftRadius: "4px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }
              : { background: "linear-gradient(135deg,#7c3aed,#9d5cf5)", color: "#fff", borderBottomRightRadius: "4px" }
          }
        >
          {msg.text.split("**").map((part, i) =>
            i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
          )}
        </div>

        <div className={`flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${isBot ? "justify-start" : "justify-end"}`}>
          <span className="text-xs" style={{ color: "#7a6080" }}>{msg.time}</span>
          {!isBot && <CheckCheck size={12} style={{ color: "#7c3aed" }} />}
          {isBot && (
            <>
              <button onClick={copy} className="p-1 rounded hover:bg-black/5 transition-colors" title="Copy">
                {copied ? <CheckCheck size={13} style={{ color: "#10b981" }} /> : <Copy size={13} style={{ color: "#7a6080" }} />}
              </button>
              <button
                onClick={() => onLike(msg.id, true)}
                className="p-1 rounded hover:bg-black/5 transition-colors"
                title="Helpful"
              >
                <ThumbsUp size={13} style={{ color: msg.liked === true ? "#10b981" : "#7a6080" }} />
              </button>
              <button
                onClick={() => onLike(msg.id, false)}
                className="p-1 rounded hover:bg-black/5 transition-colors"
                title="Not helpful"
              >
                <ThumbsDown size={13} style={{ color: msg.liked === false ? "#ef4444" : "#7a6080" }} />
              </button>
            </>
          )}
        </div>
      </div>
      {!isBot && (
        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 text-white text-xs font-bold" style={{ background: "#f97316" }}>
          U
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const navigate = useNavigate();
  const [activeConvId, setActiveConvId] = useState<number | string>(1);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "bot", text: "Hello! 👋 I'm ClariBot, your AI support assistant. How can I help you today?", time: now() },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Load conversations from backend
  useEffect(() => {
    if (!getToken()) return;
    api.conversations()
      .then(items => {
        if (!items.length) return;
        const uiConvs: Conversation[] = items.map(c => ({
          id: c.id,
          title: c.title,
          preview: c.messages[c.messages.length - 1]?.text?.slice(0, 60) || "",
          time: new Date(c.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" }),
          isApi: true,
        }));
        setConversations(uiConvs);
        const latest = items[0];
        setActiveConvId(latest.id);
        setMessages(toUiMessages(latest));
      })
      .catch(() => {});
  }, []);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

  // Setup speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(prev => prev + (prev ? " " : "") + transcript);
      setIsListening(false);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    setRecognition(rec);
  }, []);

  async function send(text?: string) {
    const txt = (text ?? input).trim();
    if (!txt) return;
    const userMsg: Message = { id: Date.now(), role: "user", text: txt, time: now() };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setTyping(true);
    try {
      if (!getToken()) throw new Error("Not signed in");
      const result = await api.chat(txt, activeConvId);
      setActiveConvId(result.conversation.id);
      setTyping(false);
      setMessages(toUiMessages(result.conversation));
      // Update conversation list
      const updatedConv: Conversation = {
        id: result.conversation.id,
        title: result.conversation.title,
        preview: result.reply.text.slice(0, 60),
        time: "Just now",
        isApi: true,
      };
      setConversations(prev => {
        const without = prev.filter(c => c.id !== updatedConv.id);
        return [updatedConv, ...without];
      });
    } catch {
      setTimeout(() => {
        setTyping(false);
        setMessages(m => [...m, { id: Date.now() + 1, role: "bot", text: getBotReply(txt), time: now() }]);
      }, 700);
    }
  }

  async function startNewConversation() {
    try {
      const conv = getToken() ? await api.newConversation() : null;
      if (conv) {
        setActiveConvId(conv.id);
        setMessages(toUiMessages(conv));
        setConversations(prev => [{
          id: conv.id, title: conv.title,
          preview: "New conversation started", time: "Now", isApi: true,
        }, ...prev]);
      } else {
        setActiveConvId(Date.now());
        setMessages([{ id: 0, role: "bot", text: "Hi there! Starting a new conversation. What can I help you with?", time: now() }]);
      }
    } catch {
      setActiveConvId(Date.now());
      setMessages([{ id: 0, role: "bot", text: "Hi there! Starting a new conversation. What can I help you with?", time: now() }]);
    }
  }

  async function deleteCurrentConversation() {
    setMoreMenuOpen(false);
    if (typeof activeConvId === "string" && getToken()) {
      try { await api.deleteConversation(activeConvId); } catch { }
    }
    setConversations(prev => prev.filter(c => c.id !== activeConvId));
    await startNewConversation();
  }

  function exportChat() {
    setMoreMenuOpen(false);
    const text = messages.map(m => `[${m.time}] ${m.role === "bot" ? "ClariBot" : "You"}: ${m.text}`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `chat-export-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function refreshConversation() {
    if (!getToken() || typeof activeConvId !== "string") return;
    api.conversations().then(items => {
      const conv = items.find(c => c.id === activeConvId);
      if (conv) setMessages(toUiMessages(conv));
    }).catch(() => {});
  }

  function toggleMic() {
    if (!recognition) {
      alert("Speech recognition is not supported in your browser. Try Chrome.");
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  }

  function handleFileAttach() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxMB = 5;
    if (file.size > maxMB * 1024 * 1024) {
      alert(`File too large. Maximum size is ${maxMB}MB.`);
      return;
    }
    // Tell the bot a file was attached
    send(`[Attached file: ${file.name}]`);
    e.target.value = "";
  }

  function handleLike(id: number | string, v: boolean) {
    setMessages(m => m.map(msg => msg.id === id ? { ...msg, liked: v } : msg));
  }

  function handleLogout() {
    clearSession();
    navigate("/login");
  }

  const filtered = conversations.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-4rem)]" style={{ fontFamily: "var(--font-body)" }}>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ── Sidebar ── */}
      <aside
        className={`flex-shrink-0 flex flex-col border-r transition-all duration-300 ${sidebarOpen ? "w-72" : "w-0 overflow-hidden"}`}
        style={{ borderColor: "rgba(124,58,237,0.1)", background: "#fff" }}
      >
        <div className="p-4 border-b" style={{ borderColor: "rgba(124,58,237,0.08)" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>Conversations</h2>
            <button
              onClick={startNewConversation}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[#f3e8ff]"
              style={{ background: "rgba(124,58,237,0.08)" }}
              title="New chat"
            >
              <Plus size={16} style={{ color: "#7c3aed" }} />
            </button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#7a6080" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: "#f5e6f0", color: "#12082a" }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: "none" }}>
          {filtered.length === 0 ? (
            <p className="text-xs text-center py-8" style={{ color: "#7a6080" }}>No conversations yet.</p>
          ) : (
            filtered.map(conv => (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveConvId(conv.id);
                  if (conv.isApi && getToken()) {
                    api.conversations().then(items => {
                      const c = items.find(x => x.id === conv.id);
                      if (c) setMessages(toUiMessages(c));
                    }).catch(() => {});
                  }
                }}
                className="w-full text-left px-4 py-3 transition-colors hover:bg-[#fef0f5] flex items-start gap-3"
                style={{ background: activeConvId === conv.id ? "#f3e8ff" : "transparent" }}
              >
                <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: activeConvId === conv.id ? "#7c3aed" : "rgba(124,58,237,0.1)" }}>
                  <MessageSquare size={15} style={{ color: activeConvId === conv.id ? "#fff" : "#7c3aed" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-semibold truncate" style={{ color: "#12082a", fontFamily: "var(--font-display)" }}>{conv.title}</p>
                    <span className="text-xs flex-shrink-0 ml-1" style={{ color: "#7a6080" }}>{conv.time}</span>
                  </div>
                  <p className="text-xs truncate" style={{ color: "#7a6080" }}>{conv.preview}</p>
                </div>
                {conv.unread && (
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "#7c3aed", fontSize: "10px" }}>
                    {conv.unread}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        <div className="p-4 border-t space-y-2" style={{ borderColor: "rgba(124,58,237,0.08)" }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(16,185,129,0.08)" }}>
            <span className="w-2 h-2 rounded-full" style={{ background: "#10b981" }} />
            <span className="text-xs font-medium" style={{ color: "#10b981" }}>ClariBot is online</span>
            <Sparkles size={11} style={{ color: "#10b981", marginLeft: "auto" }} />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors hover:bg-red-50"
            style={{ color: "#ef4444" }}
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: "#fef9ff" }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b bg-white relative" style={{ borderColor: "rgba(124,58,237,0.1)" }}>
          <button onClick={() => setSidebarOpen(v => !v)} className="p-2 rounded-lg transition-colors hover:bg-[#f3e8ff]">
            {sidebarOpen ? <X size={18} style={{ color: "#7c3aed" }} /> : <MessageSquare size={18} style={{ color: "#7c3aed" }} />}
          </button>
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7c3aed,#9d5cf5)" }}>
            <Bot size={17} color="#fff" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>ClariBot</p>
            <p className="text-xs" style={{ color: "#10b981" }}>● Online — replies instantly</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={refreshConversation}
              className="p-2 rounded-lg transition-colors hover:bg-[#f3e8ff]"
              title="Refresh conversation"
            >
              <RefreshCw size={16} style={{ color: "#7a6080" }} />
            </button>
            <button
              onClick={() => setMoreMenuOpen(v => !v)}
              className="p-2 rounded-lg transition-colors hover:bg-[#f3e8ff]"
              title="More options"
            >
              <MoreHorizontal size={16} style={{ color: "#7a6080" }} />
            </button>
          </div>

          {/* More menu dropdown */}
          {moreMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMoreMenuOpen(false)} />
              <div
                className="absolute right-4 top-14 z-20 rounded-xl shadow-xl border py-1 w-48"
                style={{ background: "#fff", borderColor: "rgba(124,58,237,0.15)" }}
              >
                <button
                  onClick={exportChat}
                  className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-[#f3e8ff] transition-colors"
                  style={{ color: "#12082a" }}
                >
                  <Download size={14} /> Export chat
                </button>
                <button
                  onClick={startNewConversation}
                  className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-[#f3e8ff] transition-colors"
                  style={{ color: "#12082a" }}
                >
                  <Plus size={14} /> New conversation
                </button>
                <div className="my-1 h-px mx-3" style={{ background: "rgba(124,58,237,0.1)" }} />
                <button
                  onClick={deleteCurrentConversation}
                  className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-red-50 transition-colors"
                  style={{ color: "#ef4444" }}
                >
                  <Trash2 size={14} /> Delete conversation
                </button>
              </div>
            </>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4" style={{ scrollbarWidth: "none" }}>
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.1)" }} />
            <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(124,58,237,0.08)", color: "#7a6080" }}>Today</span>
            <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.1)" }} />
          </div>

          {messages.map(m => <Bubble key={m.id} msg={m} onLike={handleLike} />)}

          {typing && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7c3aed,#9d5cf5)" }}>
                <Bot size={15} color="#fff" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white shadow-sm" style={{ borderBottomLeftRadius: "4px" }}>
                <span className="flex gap-1 items-center">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-2 h-2 rounded-full" style={{ background: "#7c3aed", animation: `bounce 1s infinite ${i * 0.15}s` }} />
                  ))}
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies */}
        {messages.length <= 1 && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {QUICK_REPLIES.map(q => (
              <button
                key={q}
                onClick={() => send(q)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:bg-[#f3e8ff] hover:border-[#7c3aed]"
                style={{ borderColor: "rgba(124,58,237,0.2)", color: "#7c3aed", background: "#fff", fontFamily: "var(--font-body)" }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Voice indicator */}
        {isListening && (
          <div className="mx-5 mb-2 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium" style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#ef4444" }} />
            Listening… speak now
            <button onClick={toggleMic} className="ml-auto"><StopCircle size={16} /></button>
          </div>
        )}

        {/* Input bar */}
        <div className="px-5 pb-5 pt-2">
          <div
            className="flex items-end gap-2 rounded-2xl px-4 py-3 border"
            style={{ background: "#fff", borderColor: "rgba(124,58,237,0.15)", boxShadow: "0 2px 12px rgba(124,58,237,0.08)" }}
          >
            <div className="flex gap-1">
              <button
                onClick={handleFileAttach}
                className="p-1.5 rounded-lg transition-colors hover:bg-[#f3e8ff]"
                title="Attach file (image, PDF, doc, txt — max 5MB)"
              >
                <Paperclip size={17} style={{ color: "#7a6080" }} />
              </button>
              <button className="p-1.5 rounded-lg transition-colors hover:bg-[#f3e8ff]" title="Emoji (coming soon)">
                <Smile size={17} style={{ color: "#7a6080" }} />
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="flex-1 resize-none text-sm outline-none leading-relaxed"
              style={{ color: "#12082a", background: "transparent", fontFamily: "var(--font-body)", maxHeight: "120px" }}
            />
            <div className="flex gap-1">
              <button
                onClick={toggleMic}
                className="p-1.5 rounded-lg transition-colors hover:bg-[#f3e8ff]"
                title={isListening ? "Stop listening" : "Voice input"}
              >
                {isListening
                  ? <MicOff size={17} style={{ color: "#ef4444" }} />
                  : <Mic size={17} style={{ color: "#7a6080" }} />}
              </button>
              <button
                onClick={() => send()}
                disabled={!input.trim() || typing}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 hover:scale-105"
                style={{ background: "linear-gradient(135deg,#7c3aed,#9d5cf5)" }}
              >
                <Send size={16} color="#fff" />
              </button>
            </div>
          </div>
          <p className="text-center text-xs mt-2" style={{ color: "#7a6080" }}>
            ClariBot may occasionally make mistakes. Verify important information.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        textarea { scrollbar-width: none; }
      `}</style>
    </div>
  );
}
