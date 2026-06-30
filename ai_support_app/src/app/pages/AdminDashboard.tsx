import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  MessageCircle, TrendingUp, Users, Clock, Star, Zap, AlertTriangle, CheckCircle,
  MoreHorizontal, Search, Download, RefreshCw, Bot, ArrowUpRight, Eye, Trash2,
  Globe, BarChart2, Save, X, LogOut, Loader2,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { api, clearSession, getToken, type ApiSummary, type ApiConversation, type ApiSettings } from "../lib/api";

// ── Static chart data ─────────────────────────────────────────────────────────

const HOURLY = [
  { h: "00", chats: 12 }, { h: "02", chats: 8 }, { h: "04", chats: 5 },
  { h: "06", chats: 18 }, { h: "08", chats: 54 }, { h: "10", chats: 97 },
  { h: "12", chats: 88 }, { h: "14", chats: 102 }, { h: "16", chats: 91 },
  { h: "18", chats: 76 }, { h: "20", chats: 48 }, { h: "22", chats: 27 },
];

const WEEKLY = [
  { day: "Mon", resolved: 412, escalated: 38 },
  { day: "Tue", resolved: 389, escalated: 29 },
  { day: "Wed", resolved: 457, escalated: 41 },
  { day: "Thu", resolved: 501, escalated: 35 },
  { day: "Fri", resolved: 468, escalated: 44 },
  { day: "Sat", resolved: 223, escalated: 18 },
  { day: "Sun", resolved: 187, escalated: 14 },
];

const SENTIMENT_CHART = [
  { day: "Mon", positive: 74, neutral: 18, negative: 8 },
  { day: "Tue", positive: 78, neutral: 15, negative: 7 },
  { day: "Wed", positive: 72, neutral: 20, negative: 8 },
  { day: "Thu", positive: 81, neutral: 13, negative: 6 },
  { day: "Fri", positive: 77, neutral: 17, negative: 6 },
  { day: "Sat", positive: 83, neutral: 12, negative: 5 },
  { day: "Sun", positive: 85, neutral: 11, negative: 4 },
];

const CHANNEL_PIE = [
  { name: "Website", value: 48, color: "#7c3aed" },
  { name: "WhatsApp", value: 22, color: "#f97316" },
  { name: "Slack", value: 15, color: "#06b6d4" },
  { name: "Email", value: 10, color: "#10b981" },
  { name: "Other", value: 5, color: "#e5e7eb" },
];

const TOP_TOPICS = [
  { topic: "Billing & Payments", count: 342, pct: 24 },
  { topic: "Account Access", count: 271, pct: 19 },
  { topic: "Integration Setup", count: 214, pct: 15 },
  { topic: "Plan Upgrade", count: 185, pct: 13 },
  { topic: "API Questions", count: 142, pct: 10 },
  { topic: "Other", count: 274, pct: 19 },
];

type Tab = "overview" | "conversations" | "analytics" | "settings";

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, delta, up, icon: Icon, color }: {
  label: string; value: string; delta: string; up: boolean; icon: any; color: string;
}) {
  return (
    <div className="p-5 rounded-2xl bg-white border flex flex-col gap-3" style={{ borderColor: "rgba(124,58,237,0.1)" }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#7a6080" }}>{label}</p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={17} style={{ color }} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>{value}</p>
        <div className="flex items-center gap-1 mt-1">
          {up
            ? <ArrowUpRight size={13} style={{ color: "#10b981" }} />
            : <ArrowUpRight size={13} style={{ color: "#ef4444", transform: "rotate(90deg)" }} />}
          <span className="text-xs font-medium" style={{ color: up ? "#10b981" : "#ef4444" }}>{delta}</span>
          <span className="text-xs" style={{ color: "#7a6080" }}> vs last week</span>
        </div>
      </div>
    </div>
  );
}

function CT({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl shadow-lg text-xs" style={{ background: "#fff", border: "1px solid rgba(124,58,237,0.15)" }}>
      <p className="font-semibold mb-1" style={{ color: "#12082a" }}>{label}</p>
      {payload.map((p: any) => <p key={p.name} style={{ color: p.color ?? p.stroke }}>{p.name}: {p.value}</p>)}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    resolved: { bg: "rgba(16,185,129,0.1)", color: "#10b981" },
    escalated: { bg: "rgba(239,68,68,0.1)", color: "#ef4444" },
    open: { bg: "rgba(249,115,22,0.1)", color: "#f97316" },
  };
  const s = styles[status] ?? styles.open;
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const map: Record<string, { emoji: string; color: string }> = {
    positive: { emoji: "😊", color: "#10b981" },
    neutral: { emoji: "😐", color: "#f97316" },
    negative: { emoji: "😤", color: "#ef4444" },
  };
  const s = map[sentiment] ?? map.neutral;
  return <span style={{ color: s.color }} className="text-sm">{s.emoji} <span className="text-xs capitalize">{sentiment}</span></span>;
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [convSearch, setConvSearch] = useState("");
  const [summary, setSummary] = useState<ApiSummary | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [convMenuOpen, setConvMenuOpen] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<ApiConversation | null>(null);
const [loadingConversation, setLoadingConversation] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<ApiSettings>({
    businessName: "ClariBot Demo",
    escalationEmail: "admin@yourcompany.com",
    botTone: "Friendly and concise",
    retentionDays: 90,
    confidenceThreshold: 85,
    maxTurns: 8,
    slackWebhook: "",
  });
  const [savingSettings, setSavingSettings] = useState(false);

  function showToast(msg: string, type: "ok" | "err" = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const loadData = useCallback(async () => {
    if (!getToken()) { navigate("/admin-login"); return; }
    setLoadingData(true);
    try {
      const [sum, sett] = await Promise.all([api.adminSummary(), api.adminSettings()]);
      setSummary(sum);
      setSettings(prev => ({ ...prev, ...sett }));
      setLastUpdated(new Date());
    } catch (e: any) {
      if (e.message?.includes("401") || e.message?.includes("token")) navigate("/admin-login");
      else showToast("Failed to load data", "err");
    } finally {
      setLoadingData(false);
    }
  }, [navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  function handleExport() {
    const url = api.adminExportUrl();
    const token = getToken();
    // Fetch with auth then trigger download
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `conversations-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
        showToast("Export downloaded ✓");
      })
      .catch(() => showToast("Export failed", "err"));
  }

  async function handleDeleteConversation(id: string) {
    setDeletingId(id);
    setConvMenuOpen(null);
    try {
      await api.adminDeleteConversation(id);
      setSummary(prev => prev ? {
        ...prev,
        totalConversations: prev.totalConversations - 1,
        recentConversations: prev.recentConversations.filter(c => c.id !== id),
      } : prev);
      showToast("Conversation deleted");
    } catch {
      showToast("Delete failed", "err");
    } finally {
      setDeletingId(null);
    }
  }
  async function handleViewConversation(id: string) {
  setConvMenuOpen(null);
  setLoadingConversation(true);

  try {
    const conversation = await api.adminGetConversation(id);
    setSelectedConversation(conversation);
  } catch {
    showToast("Could not open chat log", "err");
  } finally {
    setLoadingConversation(false);
  }
}

  async function handleSaveSettings() {
    setSavingSettings(true);
    try {
      const saved = await api.saveSettings(settings);
      setSettings(prev => ({ ...prev, ...saved }));
      showToast("Settings saved ✓");
    } catch {
      showToast("Save failed", "err");
    } finally {
      setSavingSettings(false);
    }
  }

  function handleLogout() {
    clearSession();
    navigate("/login");
  }

  const filteredConvs = (summary?.recentConversations || []).filter(c =>
    !convSearch || c.title.toLowerCase().includes(convSearch.toLowerCase()) ||
    c.status.toLowerCase().includes(convSearch.toLowerCase())
  );

  const liveStats = summary ? [
    {
      label: "Total conversations", value: String(summary.totalConversations),
      delta: "+12%", up: true, icon: MessageCircle, color: "#7c3aed"
    },
    {
      label: "Resolution rate", value: `${summary.resolutionRate}%`,
      delta: "+3%", up: true, icon: CheckCircle, color: "#10b981"
    },
    {
      label: "Escalated", value: String(summary.escalated),
      delta: summary.escalated > 5 ? "+2" : "-1", up: summary.escalated <= 5, icon: AlertTriangle, color: "#ef4444"
    },
    {
      label: "Total users", value: String(summary.users),
      delta: "+8%", up: true, icon: Users, color: "#f97316"
    },
    {
      label: "Leads captured", value: String(summary.leads),
      delta: "+15%", up: true, icon: Star, color: "#06b6d4"
    },
    {
      label: "Avg response", value: "< 1s",
      delta: "stable", up: true, icon: Zap, color: "#8b5cf6"
    },
  ] : [];

  return (
    <div className="p-6 max-w-7xl mx-auto relative" style={{ fontFamily: "var(--font-body)" }}>

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-in slide-in-from-right"
          style={{ background: toast.type === "ok" ? "#10b981" : "#ef4444", color: "#fff" }}
        >
          {toast.type === "ok" ? <CheckCircle size={15} /> : <X size={15} />}
          {toast.msg}
        </div>
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>
            Admin Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#7a6080" }}>
            Last updated: {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            {loadingData && " · Refreshing…"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all hover:bg-[#f3e8ff]"
            style={{ borderColor: "rgba(124,58,237,0.2)", color: "#7c3aed" }}
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={loadData}
            disabled={loadingData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#7c3aed,#9d5cf5)" }}
          >
            {loadingData
              ? <Loader2 size={14} className="animate-spin" />
              : <RefreshCw size={14} />}
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all hover:bg-red-50"
            style={{ borderColor: "rgba(239,68,68,0.2)", color: "#ef4444" }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: "#f3e8ff" }}>
        {(["overview", "conversations", "analytics", "settings"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all"
            style={{
              background: tab === t ? "#7c3aed" : "transparent",
              color: tab === t ? "#fff" : "#4a3060",
              fontFamily: "var(--font-display)",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ──────────────────────────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="space-y-6">
          {loadingData && !summary ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 size={32} className="animate-spin" style={{ color: "#7c3aed" }} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {liveStats.map(s => <StatCard key={s.label} {...s} />)}
              </div>

              {/* Hourly volume */}
              <div className="p-5 rounded-2xl bg-white border" style={{ borderColor: "rgba(124,58,237,0.1)" }}>
                <p className="font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>
                  Chat volume — today (hourly)
                </p>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={HOURLY}>
                    <defs>
                      <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.08)" />
                    <XAxis dataKey="h" tick={{ fontSize: 11, fill: "#7a6080" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#7a6080" }} />
                    <Tooltip content={<CT />} />
                    <Area type="monotone" dataKey="chats" stroke="#7c3aed" fill="url(#cg)" strokeWidth={2} name="Chats" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Weekly breakdown + Sentiment */}
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white border" style={{ borderColor: "rgba(124,58,237,0.1)" }}>
                  <p className="font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>Weekly resolution</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={WEEKLY}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.08)" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#7a6080" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#7a6080" }} />
                      <Tooltip content={<CT />} />
                      <Bar dataKey="resolved" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Resolved" />
                      <Bar dataKey="escalated" fill="#ef4444" radius={[4, 4, 0, 0]} name="Escalated" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-5 rounded-2xl bg-white border" style={{ borderColor: "rgba(124,58,237,0.1)" }}>
                  <p className="font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>Channel distribution</p>
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width={160} height={160}>
                      <PieChart>
                        <Pie data={CHANNEL_PIE} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                          {CHANNEL_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip formatter={(v: any, n: any) => [`${v}%`, n]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-2">
                      {CHANNEL_PIE.map(e => (
                        <div key={e.name} className="flex items-center gap-2 text-xs">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: e.color }} />
                          <span style={{ color: "#12082a" }}>{e.name}</span>
                          <span className="ml-auto font-semibold" style={{ color: "#7a6080" }}>{e.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Top topics */}
              <div className="p-5 rounded-2xl bg-white border" style={{ borderColor: "rgba(124,58,237,0.1)" }}>
                <p className="font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>Top conversation topics</p>
                <div className="flex flex-col gap-3">
                  {TOP_TOPICS.map(t => (
                    <div key={t.topic} className="flex items-center gap-3">
                      <span className="text-sm w-40 flex-shrink-0" style={{ color: "#12082a" }}>{t.topic}</span>
                      <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(124,58,237,0.08)" }}>
                        <div className="h-full rounded-full" style={{ width: `${t.pct}%`, background: "linear-gradient(90deg,#7c3aed,#9d5cf5)" }} />
                      </div>
                      <span className="text-xs w-10 text-right font-semibold" style={{ color: "#7a6080" }}>{t.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── CONVERSATIONS ─────────────────────────────────────────────────────── */}
      {tab === "conversations" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#7a6080" }} />
              <input
                value={convSearch}
                onChange={e => setConvSearch(e.target.value)}
                placeholder="Search conversations…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none border"
                style={{ background: "#fef9ff", borderColor: "rgba(124,58,237,0.2)", color: "#12082a" }}
              />
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all hover:bg-[#f3e8ff]"
              style={{ borderColor: "rgba(124,58,237,0.2)", color: "#7c3aed" }}
            >
              <RefreshCw size={13} /> Reload
            </button>
          </div>

          {loadingData && !summary ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 size={28} className="animate-spin" style={{ color: "#7c3aed" }} />
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="text-center py-16 text-sm" style={{ color: "#7a6080" }}>
              No conversations found. Start chatting to see them here.
            </div>
          ) : (
            <div className="rounded-2xl bg-white border overflow-hidden" style={{ borderColor: "rgba(124,58,237,0.1)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "rgba(124,58,237,0.04)", borderBottom: "1px solid rgba(124,58,237,0.08)" }}>
                    {["Title", "Status", "Sentiment", "Messages", "Updated", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#7a6080" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredConvs.map((c, i) => (
                    <tr
                      key={c.id}
                      style={{ borderBottom: i < filteredConvs.length - 1 ? "1px solid rgba(124,58,237,0.06)" : "none" }}
                      className="hover:bg-[#fef9ff] transition-colors"
                    >
                      <td className="px-4 py-3 font-medium max-w-[200px] truncate" style={{ color: "#12082a" }}>{c.title}</td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3"><SentimentBadge sentiment={c.sentiment} /></td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#7a6080" }}>{c.messageCount ?? "—"}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#7a6080" }}>
                        {new Date(c.updatedAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative flex items-center gap-1">
                          <button
                            onClick={() => setConvMenuOpen(convMenuOpen === c.id ? null : c.id)}
                            className="p-1.5 rounded-lg transition-colors hover:bg-[#f3e8ff]"
                          >
                            <MoreHorizontal size={15} style={{ color: "#7a6080" }} />
                          </button>
                          {convMenuOpen === c.id && (
                            <div
                              className="absolute right-0 top-8 z-20 rounded-xl shadow-xl border py-1 w-40"
                              style={{ background: "#fff", borderColor: "rgba(124,58,237,0.15)" }}
                            >
                              <button
  onClick={() => handleViewConversation(c.id)}
  className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-[#f3e8ff] transition-colors"
  style={{ color: "#12082a" }}
>
  <Eye size={13} /> View messages
</button>
                              <button
                                onClick={() => handleDeleteConversation(c.id)}
                                className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-red-50 transition-colors"
                                style={{ color: "#ef4444" }}
                              >
                                {deletingId === c.id
                                  ? <Loader2 size={13} className="animate-spin" />
                                  : <Trash2 size={13} />}
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── ANALYTICS ─────────────────────────────────────────────────────────── */}
      {tab === "analytics" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white border" style={{ borderColor: "rgba(124,58,237,0.1)" }}>
            <p className="font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>Sentiment trend (7-day)</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={SENTIMENT_CHART}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.08)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#7a6080" }} />
                <YAxis tick={{ fontSize: 11, fill: "#7a6080" }} />
                <Tooltip content={<CT />} />
                <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} dot={false} name="Positive %" />
                <Line type="monotone" dataKey="neutral" stroke="#f97316" strokeWidth={2} dot={false} name="Neutral %" />
                <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} dot={false} name="Negative %" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {summary && (
            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border text-center" style={{ borderColor: "rgba(16,185,129,0.2)" }}>
                <p className="text-3xl font-extrabold" style={{ color: "#10b981" }}>{summary.sentiment.positive}</p>
                <p className="text-sm mt-1" style={{ color: "#7a6080" }}>Positive conversations</p>
              </div>
              <div className="p-5 rounded-2xl bg-white border text-center" style={{ borderColor: "rgba(249,115,22,0.2)" }}>
                <p className="text-3xl font-extrabold" style={{ color: "#f97316" }}>{summary.sentiment.neutral}</p>
                <p className="text-sm mt-1" style={{ color: "#7a6080" }}>Neutral conversations</p>
              </div>
              <div className="p-5 rounded-2xl bg-white border text-center" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
                <p className="text-3xl font-extrabold" style={{ color: "#ef4444" }}>{summary.sentiment.negative}</p>
                <p className="text-sm mt-1" style={{ color: "#7a6080" }}>Negative conversations</p>
              </div>
            </div>
          )}

          <div className="p-5 rounded-2xl bg-white border" style={{ borderColor: "rgba(124,58,237,0.1)" }}>
            <p className="font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>Export raw data</p>
            <p className="text-sm mb-4" style={{ color: "#7a6080" }}>Download all conversations as a CSV file for analysis in Excel or Google Sheets.</p>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
              style={{ background: "linear-gradient(135deg,#7c3aed,#9d5cf5)" }}
            >
              <Download size={15} /> Download CSV
            </button>
          </div>
        </div>
      )}

      {/* ── SETTINGS ──────────────────────────────────────────────────────────── */}
      {tab === "settings" && (
        <div className="max-w-2xl space-y-5">
          {/* Business info */}
          <div className="p-5 rounded-2xl bg-white border" style={{ borderColor: "rgba(124,58,237,0.1)" }}>
            <p className="font-bold text-base mb-4" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>Business Info</p>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-0.5" style={{ color: "#12082a" }}>Business name</label>
                <input
                  value={settings.businessName || ""}
                  onChange={e => setSettings(s => ({ ...s, businessName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors focus:border-[#7c3aed]"
                  style={{ background: "#fef9ff", borderColor: "rgba(124,58,237,0.2)", color: "#12082a" }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-0.5" style={{ color: "#12082a" }}>Bot tone</label>
                <select
                  value={settings.botTone || ""}
                  onChange={e => setSettings(s => ({ ...s, botTone: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors focus:border-[#7c3aed]"
                  style={{ background: "#fef9ff", borderColor: "rgba(124,58,237,0.2)", color: "#12082a" }}
                >
                  <option>Friendly and concise</option>
                  <option>Professional and formal</option>
                  <option>Casual and fun</option>
                  <option>Empathetic and supportive</option>
                </select>
              </div>
            </div>
          </div>

          {/* AI Behaviour */}
          <div className="p-5 rounded-2xl bg-white border" style={{ borderColor: "rgba(124,58,237,0.1)" }}>
            <p className="font-bold text-base mb-4" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>AI Behaviour</p>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-0.5" style={{ color: "#12082a" }}>
                  Response confidence threshold: <span style={{ color: "#7c3aed" }}>{settings.confidenceThreshold}%</span>
                </label>
                <p className="text-xs mb-2" style={{ color: "#7a6080" }}>Bot escalates when confidence drops below this level</p>
                <input
                  type="range" min={50} max={100}
                  value={settings.confidenceThreshold ?? 85}
                  onChange={e => setSettings(s => ({ ...s, confidenceThreshold: Number(e.target.value) }))}
                  className="w-full accent-[#7c3aed]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-0.5" style={{ color: "#12082a" }}>Max turns before handoff</label>
                <p className="text-xs mb-2" style={{ color: "#7a6080" }}>After N turns without resolution, escalate to a human</p>
                <input
                  type="number" min={1} max={50}
                  value={settings.maxTurns ?? 8}
                  onChange={e => setSettings(s => ({ ...s, maxTurns: Number(e.target.value) }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors focus:border-[#7c3aed]"
                  style={{ background: "#fef9ff", borderColor: "rgba(124,58,237,0.2)", color: "#12082a" }}
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="p-5 rounded-2xl bg-white border" style={{ borderColor: "rgba(124,58,237,0.1)" }}>
            <p className="font-bold text-base mb-4" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>Notifications</p>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-0.5" style={{ color: "#12082a" }}>Escalation alert email</label>
                <p className="text-xs mb-2" style={{ color: "#7a6080" }}>Receives an email every time a conversation is escalated</p>
                <input
                  type="email"
                  value={settings.escalationEmail || ""}
                  onChange={e => setSettings(s => ({ ...s, escalationEmail: e.target.value }))}
                  placeholder="admin@yourcompany.com"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors focus:border-[#7c3aed]"
                  style={{ background: "#fef9ff", borderColor: "rgba(124,58,237,0.2)", color: "#12082a" }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-0.5" style={{ color: "#12082a" }}>Slack webhook URL</label>
                <p className="text-xs mb-2" style={{ color: "#7a6080" }}>Post escalation summaries to a Slack channel</p>
                <input
                  type="url"
                  value={settings.slackWebhook || ""}
                  onChange={e => setSettings(s => ({ ...s, slackWebhook: e.target.value }))}
                  placeholder="https://hooks.slack.com/…"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors focus:border-[#7c3aed]"
                  style={{ background: "#fef9ff", borderColor: "rgba(124,58,237,0.2)", color: "#12082a" }}
                />
              </div>
            </div>
          </div>

          {/* Data retention */}
          <div className="p-5 rounded-2xl bg-white border" style={{ borderColor: "rgba(124,58,237,0.1)" }}>
            <p className="font-bold text-base mb-4" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>Data Retention</p>
            <div>
              <label className="block text-sm font-semibold mb-0.5" style={{ color: "#12082a" }}>Retention period (days)</label>
              <p className="text-xs mb-2" style={{ color: "#7a6080" }}>Conversations older than this are automatically deleted</p>
              <input
                type="number" min={7} max={365}
                value={settings.retentionDays ?? 90}
                onChange={e => setSettings(s => ({ ...s, retentionDays: Number(e.target.value) }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors focus:border-[#7c3aed]"
                style={{ background: "#fef9ff", borderColor: "rgba(124,58,237,0.2)", color: "#12082a" }}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#7c3aed,#9d5cf5)", fontFamily: "var(--font-display)" }}
            >
              {savingSettings ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {savingSettings ? "Saving…" : "Save Changes"}
            </button>
            <button
              onClick={loadData}
              className="px-6 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-[#f3e8ff]"
              style={{ borderColor: "rgba(124,58,237,0.2)", color: "#7a6080" }}
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {convMenuOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setConvMenuOpen(null)} />
      )}
      {loadingConversation && (
  <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
    <div className="bg-white rounded-2xl p-6 shadow-2xl flex items-center gap-3">
      <Loader2 className="animate-spin" size={20} />
      <span>Loading chat log...</span>
    </div>
  </div>
)}

{selectedConversation && (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
    <div className="w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h2 className="text-lg font-bold" style={{ color: "#12082a" }}>
            {selectedConversation.title}
          </h2>
          <p className="text-xs" style={{ color: "#7a6080" }}>
            Status: {selectedConversation.status} · Sentiment: {selectedConversation.sentiment}
          </p>
        </div>

        <button
          onClick={() => setSelectedConversation(null)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-6 overflow-y-auto space-y-4 max-h-[65vh]" style={{ background: "#fef9ff" }}>
        {selectedConversation.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[75%] rounded-2xl px-4 py-3 text-sm"
              style={{
                background: message.role === "user" ? "#7c3aed" : "#fff",
                color: message.role === "user" ? "#fff" : "#12082a",
                boxShadow: "0 1px 5px rgba(0,0,0,0.08)",
              }}
            >
              <p className="mb-1 text-[11px] opacity-70">
                {message.role === "user" ? "Customer" : "ClariBot"} ·{" "}
                {new Date(message.createdAt).toLocaleString()}
              </p>
              <p>{message.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
    </div>
  );
}
