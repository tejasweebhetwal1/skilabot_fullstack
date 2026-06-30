import { useNavigate } from "react-router";
import {
  TrendingUp,
  Clock,
  Users,
  DollarSign,
  ArrowRight,
  CheckCircle,
  BarChart2,
  Zap,
  Shield,
  Globe,
  Star,
  Download,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";

// ─── Data ─────────────────────────────────────────────────────────────────────

const ROI_DATA = [
  { month: "Jan", before: 42000, after: 18000 },
  { month: "Feb", before: 45000, after: 16000 },
  { month: "Mar", before: 43000, after: 14500 },
  { month: "Apr", before: 47000, after: 13000 },
  { month: "May", before: 44000, after: 12500 },
  { month: "Jun", before: 46000, after: 11800 },
];

const RESOLUTION_DATA = [
  { month: "Jan", rate: 62 },
  { month: "Feb", rate: 71 },
  { month: "Mar", rate: 79 },
  { month: "Apr", rate: 85 },
  { month: "May", rate: 91 },
  { month: "Jun", rate: 97 },
];

const CSAT_DATA = [
  { month: "Jan", score: 3.2 },
  { month: "Feb", score: 3.6 },
  { month: "Mar", score: 3.9 },
  { month: "Apr", score: 4.2 },
  { month: "May", score: 4.6 },
  { month: "Jun", score: 4.8 },
];

const USE_CASES = [
  {
    industry: "E-commerce",
    headline: "78% fewer escalations",
    detail: "Orion SaaS reduced their L1 ticket volume by 78% in 30 days after training ClariBot on 400 product FAQs and their returns policy.",
    metric: "$340K saved annually",
    color: "#7c3aed",
    tags: ["Order tracking", "Returns", "Inventory"],
  },
  {
    industry: "FinTech",
    headline: "10× faster response",
    detail: "NovaPay deployed ClariBot across 30 markets. Response time dropped from 4 hours to 140ms. CSAT improved from 3.1 to 4.7.",
    metric: "4.7 CSAT score",
    color: "#f97316",
    tags: ["Account queries", "Fraud alerts", "Compliance"],
  },
  {
    industry: "Healthcare",
    headline: "24/7 patient support",
    detail: "Lumio Health uses ClariBot to handle appointment booking, prescription questions, and insurance queries — all HIPAA-compliant.",
    metric: "99.9% uptime",
    color: "#10b981",
    tags: ["Appointments", "Prescriptions", "Insurance"],
  },
  {
    industry: "SaaS",
    headline: "60% cost reduction",
    detail: "Feather Commerce cut their support headcount cost by 60% while improving resolution rates, using ClariBot for tier-1 support.",
    metric: "60% cost reduction",
    color: "#06b6d4",
    tags: ["Onboarding", "Billing", "API help"],
  },
];

const METRICS = [
  { value: "78%", label: "Avg ticket deflection", icon: TrendingUp, color: "#7c3aed" },
  { value: "140ms", label: "Avg response time", icon: Clock, color: "#f97316" },
  { value: "4.8★", label: "Avg CSAT score", icon: Star, color: "#f59e0b" },
  { value: "$340K", label: "Avg annual savings", icon: DollarSign, color: "#10b981" },
];

const OBJECTIONS = [
  { q: "Will the bot sound robotic?", a: "ClariBot is fine-tuned on your brand voice and documentation. It adapts its tone — formal for finance, friendly for retail. Customers regularly don't realise they're talking to AI." },
  { q: "What about complex or sensitive queries?", a: "ClariBot knows its limits. When it lacks confidence, it escalates immediately — passing the full conversation context, so agents never ask customers to repeat themselves." },
  { q: "How long does implementation take?", a: "Typical enterprise deployment takes 5–10 business days: channel setup, knowledge base ingestion, QA, and go-live. Most teams are live within a week." },
  { q: "Is our data safe?", a: "All data is encrypted in transit and at rest. We are SOC 2 Type II and GDPR compliant. We never train shared models on your data without explicit consent." },
];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl shadow-lg text-sm" style={{ background: "#fff", border: "1px solid rgba(124,58,237,0.15)", fontFamily: "var(--font-body)" }}>
      <p className="font-semibold mb-1" style={{ color: "#12082a" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {typeof p.value === "number" && p.value > 100 ? `$${(p.value / 1000).toFixed(0)}K` : p.value}</p>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BusinessPage() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "var(--font-body)" }}>
      {/* Hero */}
      <section className="py-20 px-6" style={{ background: "linear-gradient(160deg,#fef0f5,#f3e8ff 60%,#fef0f5)" }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5" style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed", fontFamily: "var(--font-display)" }}>
              <BarChart2 size={12} />
              Business Case
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>
              The ROI of AI<br />
              <span style={{ color: "#7c3aed" }}>Customer Support</span>
            </h1>
            <p className="text-lg mb-8 leading-relaxed" style={{ color: "#7a6080" }}>
              ClariBot customers see an average 78% reduction in support costs and a 4.8 CSAT score — within 30 days. Here's the data behind the claim.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-3 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#7c3aed,#9d5cf5)", fontFamily: "var(--font-display)" }}
              >
                Start Free Trial
              </button>
              <button
                className="px-6 py-3 rounded-xl text-sm font-bold border flex items-center gap-2 transition-all hover:bg-[#f3e8ff]"
                style={{ borderColor: "#7c3aed", color: "#7c3aed", fontFamily: "var(--font-display)" }}
              >
                <Download size={15} />
                Download Case Study
              </button>
            </div>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-4">
            {METRICS.map(({ value, label, icon: Icon, color }) => (
              <div key={label} className="p-5 rounded-2xl bg-white border flex flex-col gap-3" style={{ borderColor: "rgba(124,58,237,0.1)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <div>
                  <p className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>{value}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#7a6080" }}>{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Charts section */}
      <section className="py-16 px-6" style={{ background: "#fff" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold mb-2" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>
              Real results from real customers
            </h2>
            <p className="text-sm" style={{ color: "#7a6080" }}>Aggregated data from 2,400+ active ClariBot deployments, Jan–Jun 2026.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Support cost */}
            <div className="p-6 rounded-2xl border" style={{ borderColor: "rgba(124,58,237,0.1)" }}>
              <p className="font-bold text-sm mb-1" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>Support Cost / Month</p>
              <p className="text-xs mb-4" style={{ color: "#7a6080" }}>Before vs. after ClariBot (USD)</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={ROI_DATA} barSize={10}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.08)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#7a6080" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#7a6080" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="before" name="Before" fill="#f3e8ff" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="after" name="After" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Resolution rate */}
            <div className="p-6 rounded-2xl border" style={{ borderColor: "rgba(124,58,237,0.1)" }}>
              <p className="font-bold text-sm mb-1" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>AI Resolution Rate</p>
              <p className="text-xs mb-4" style={{ color: "#7a6080" }}>% of tickets resolved without human handoff</p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={RESOLUTION_DATA}>
                  <defs>
                    <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.08)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#7a6080" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#7a6080" }} axisLine={false} tickLine={false} domain={[50, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="rate" name="Resolution %" stroke="#7c3aed" strokeWidth={2.5} fill="url(#resGrad)" dot={{ fill: "#7c3aed", r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* CSAT */}
            <div className="p-6 rounded-2xl border" style={{ borderColor: "rgba(124,58,237,0.1)" }}>
              <p className="font-bold text-sm mb-1" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>CSAT Score (avg)</p>
              <p className="text-xs mb-4" style={{ color: "#7a6080" }}>Customer satisfaction out of 5.0</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={CSAT_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(249,115,22,0.08)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#7a6080" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#7a6080" }} axisLine={false} tickLine={false} domain={[2.5, 5]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="score" name="CSAT" stroke="#f97316" strokeWidth={2.5} dot={{ fill: "#f97316", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-16 px-6" style={{ background: "linear-gradient(160deg,#fef0f5,#f3e8ff 60%,#fef0f5)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold mb-2" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>Industry Use Cases</h2>
            <p className="text-sm" style={{ color: "#7a6080" }}>ClariBot works across every vertical. Here's how teams are using it.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {USE_CASES.map(({ industry, headline, detail, metric, color, tags }) => (
              <div key={industry} className="p-6 rounded-2xl bg-white border flex flex-col gap-4" style={{ borderColor: "rgba(124,58,237,0.1)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: `${color}15`, color }}>{industry}</span>
                    <h3 className="text-xl font-extrabold mt-2" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>{headline}</h3>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap" style={{ background: `${color}15`, color }}>
                    {metric}
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#4a3060" }}>{detail}</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(124,58,237,0.06)", color: "#7c3aed" }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Objection handling */}
      <section className="py-16 px-6" style={{ background: "#fff" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold mb-2" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>Common Concerns</h2>
            <p className="text-sm" style={{ color: "#7a6080" }}>We've heard every objection. Here's the honest answer to each.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {OBJECTIONS.map(({ q, a }) => (
              <div key={q} className="p-6 rounded-2xl border" style={{ borderColor: "rgba(124,58,237,0.1)" }}>
                <div className="flex items-start gap-3">
                  <CheckCircle size={18} style={{ color: "#7c3aed", flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <p className="font-bold text-sm mb-2" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>{q}</p>
                    <p className="text-sm leading-relaxed" style={{ color: "#4a3060" }}>{a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6" style={{ background: "linear-gradient(160deg,#fef0f5,#f3e8ff 60%,#fef0f5)" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold mb-4" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>
            See the ROI for your team
          </h2>
          <p className="text-base mb-8" style={{ color: "#7a6080" }}>
            Start a 14-day free trial and measure the impact yourself — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#7c3aed,#9d5cf5)", fontFamily: "var(--font-display)" }}
            >
              Start Free Trial <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate("/chat")}
              className="px-8 py-3.5 rounded-xl font-bold text-sm border transition-all hover:bg-[#f3e8ff]"
              style={{ borderColor: "#7c3aed", color: "#7c3aed", fontFamily: "var(--font-display)" }}
            >
              Talk to Sales
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
