import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronDown, Search, MessageCircle, Zap, Shield, Globe, BarChart2, CreditCard, Settings, ArrowRight } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "all", label: "All Topics", icon: null },
  { id: "getting-started", label: "Getting Started", icon: Zap },
  { id: "integrations", label: "Integrations", icon: Globe },
  { id: "ai-training", label: "AI & Training", icon: Settings },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "security", label: "Security", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
];

const FAQS = [
  {
    category: "getting-started",
    q: "How do I set up ClariBot for the first time?",
    a: "Getting started takes about 5 minutes. After signing up, head to Settings → Channels and click 'Add Channel'. You can embed a chat widget on your website with a single line of code. Then go to AI Training → Knowledge Base to upload your FAQs or product docs. The bot is live immediately and improves over time.",
  },
  {
    category: "getting-started",
    q: "What languages does ClariBot support?",
    a: "ClariBot supports 50+ languages out of the box, including English, Spanish, French, German, Portuguese, Japanese, Chinese (Simplified & Traditional), Arabic, Hindi, and more. Language detection is automatic — customers type in their language and ClariBot responds in kind.",
  },
  {
    category: "getting-started",
    q: "Can I try ClariBot before buying?",
    a: "Absolutely! We offer a 14-day free trial on all plans — no credit card required. You get access to all Growth plan features during the trial. After 14 days, you can choose a plan or let it expire with no charges.",
  },
  {
    category: "integrations",
    q: "Which channels can I connect?",
    a: "ClariBot works with your website (embed widget), Slack, WhatsApp Business, Facebook Messenger, Instagram DMs, Intercom, Zendesk, HubSpot, and any REST API endpoint. Enterprise customers can also request custom channel builds.",
  },
  {
    category: "integrations",
    q: "How do I connect Slack?",
    a: "Go to Settings → Integrations → Slack, click 'Connect', and authorise ClariBot in your Slack workspace. You can choose which channels ClariBot monitors. The bot will reply to DMs or tagged messages automatically. Setup takes under 2 minutes.",
  },
  {
    category: "integrations",
    q: "Does ClariBot integrate with my existing CRM?",
    a: "Yes! We have native integrations with HubSpot, Salesforce, Intercom, and Zendesk. When a conversation ends, ClariBot can automatically create or update contact records, log conversation summaries, and sync CSAT scores.",
  },
  {
    category: "ai-training",
    q: "How do I train ClariBot on my content?",
    a: "Upload documents in Settings → AI Training → Knowledge Base. We accept PDF, DOCX, TXT, CSV, and web URLs. ClariBot parses the content, chunks it intelligently, and uses it to answer questions. Updates propagate within 15 minutes.",
  },
  {
    category: "ai-training",
    q: "How accurate is the AI?",
    a: "ClariBot achieves 94–98% answer accuracy on well-documented topics. Accuracy depends on the quality of your knowledge base. The AI also knows when it doesn't know something — it will say so and offer to escalate to a human agent rather than hallucinate.",
  },
  {
    category: "ai-training",
    q: "Can I control what topics the bot addresses?",
    a: "Yes. In Settings → AI Training → Topics, you can define allowed and blocked topics. You can also create custom response templates for sensitive topics (e.g. legal disclaimers) and set hard fallback messages for anything outside the bot's scope.",
  },
  {
    category: "analytics",
    q: "What metrics does ClariBot track?",
    a: "The analytics dashboard shows: total conversations, resolution rate, average handle time, CSAT scores, escalation rate, top unresolved topics, sentiment trends over time, peak traffic hours, and per-channel breakdowns. All data is exportable as CSV.",
  },
  {
    category: "analytics",
    q: "Can I export my analytics data?",
    a: "Yes. Go to Analytics → Export and choose a date range and format (CSV or JSON). You can also connect ClariBot to Looker, Tableau, or any BI tool via our Data API for real-time dashboards.",
  },
  {
    category: "security",
    q: "Is ClariBot SOC 2 compliant?",
    a: "Yes. ClariBot is SOC 2 Type II certified and GDPR compliant. All conversations are encrypted in transit (TLS 1.3) and at rest (AES-256). We do not train our models on your data without explicit consent. Data residency options are available for Enterprise customers.",
  },
  {
    category: "security",
    q: "How is customer data handled?",
    a: "We retain conversation data for 90 days by default (configurable). PII can be automatically redacted in real time before storage. Enterprise customers can opt for zero-retention mode where no messages are stored after processing.",
  },
  {
    category: "billing",
    q: "How is billing calculated?",
    a: "Billing is based on the number of conversations per month. A conversation is defined as a continuous exchange between one user and ClariBot within a 24-hour window — regardless of the number of messages. Overage is charged at $0.005 per conversation above your plan limit.",
  },
  {
    category: "billing",
    q: "Can I change or cancel my plan?",
    a: "You can upgrade, downgrade, or cancel at any time from Settings → Billing. Upgrades take effect immediately (prorated). Downgrades take effect at the next billing cycle. Cancellations take effect at period end — you keep access until then.",
  },
];

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="border rounded-xl overflow-hidden transition-all duration-200"
      style={{ borderColor: open ? "rgba(124,58,237,0.3)" : "rgba(124,58,237,0.1)", background: open ? "#fef9ff" : "#fff" }}
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left transition-colors"
      >
        <span className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>{q}</span>
        <ChevronDown
          size={18}
          style={{ color: "#7c3aed", flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
        />
      </button>
      {open && (
        <div className="px-6 pb-5">
          <div className="h-px mb-4" style={{ background: "rgba(124,58,237,0.1)" }} />
          <p className="text-sm leading-relaxed" style={{ color: "#4a3060", fontFamily: "var(--font-body)" }}>{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FaqPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const navigate = useNavigate();

  const filtered = FAQS.filter((f) => {
    const matchesCat = activeCategory === "all" || f.category === activeCategory;
    const matchesSearch = !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ fontFamily: "var(--font-body)" }}>
      {/* Hero */}
      <section className="py-16 px-6 text-center" style={{ background: "linear-gradient(160deg,#fef0f5,#f3e8ff 60%,#fef0f5)" }}>
        <div className="max-w-2xl mx-auto">
          <p className="text-sm font-semibold mb-3 uppercase tracking-widest" style={{ color: "#7c3aed", fontFamily: "var(--font-display)" }}>Help Center</p>
          <h1 className="text-4xl font-extrabold mb-4" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>
            Frequently Asked Questions
          </h1>
          <p className="text-base mb-8" style={{ color: "#7a6080" }}>
            Everything you need to know about ClariBot. Can't find an answer?{" "}
            <button onClick={() => navigate("/chat")} className="font-semibold hover:underline" style={{ color: "#7c3aed" }}>Chat with us →</button>
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#7a6080" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions…"
              className="w-full pl-12 pr-5 py-4 rounded-2xl text-sm outline-none border shadow-sm transition-colors focus:border-[#7c3aed]"
              style={{ background: "#fff", borderColor: "rgba(124,58,237,0.2)", color: "#12082a" }}
            />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Category sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <p className="text-xs font-bold uppercase tracking-wider mb-3 px-2" style={{ color: "#7a6080" }}>Categories</p>
            <div className="flex flex-row lg:flex-col gap-1 flex-wrap lg:flex-nowrap">
              {CATEGORIES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveCategory(id)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all"
                  style={{
                    background: activeCategory === id ? "rgba(124,58,237,0.1)" : "transparent",
                    color: activeCategory === id ? "#7c3aed" : "#4a3060",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {Icon && <Icon size={15} />}
                  {label}
                  <span className="ml-auto text-xs font-normal" style={{ color: "#7a6080" }}>
                    {id === "all" ? FAQS.length : FAQS.filter(f => f.category === id).length}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          {/* FAQ list */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <MessageCircle size={36} className="mx-auto mb-4 opacity-30" />
                <p className="font-semibold mb-1" style={{ color: "#12082a" }}>No results found</p>
                <p className="text-sm mb-4" style={{ color: "#7a6080" }}>Try a different search term or browse by category.</p>
                <button onClick={() => navigate("/chat")} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: "linear-gradient(135deg,#7c3aed,#9d5cf5)" }}>
                  Ask ClariBot directly <ArrowRight size={15} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-xs mb-2" style={{ color: "#7a6080" }}>
                  {filtered.length} {filtered.length === 1 ? "result" : "results"}
                  {search && ` for "${search}"`}
                </p>
                {filtered.map((f) => (
                  <FaqItem key={f.q} q={f.q} a={f.a} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Still have questions */}
      <section className="py-16 px-6" style={{ background: "linear-gradient(160deg,#fef0f5,#f3e8ff 60%,#fef0f5)" }}>
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-extrabold mb-3" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>Still have questions?</h2>
          <p className="text-sm mb-6" style={{ color: "#7a6080" }}>Our AI support team is online 24/7. Average response time: under 2 seconds.</p>
          <button
            onClick={() => navigate("/chat")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 hover:shadow-lg"
            style={{ background: "linear-gradient(135deg,#7c3aed,#9d5cf5)", fontFamily: "var(--font-display)" }}
          >
            <MessageCircle size={17} />
            Chat with ClariBot
          </button>
        </div>
      </section>
    </div>
  );
}
