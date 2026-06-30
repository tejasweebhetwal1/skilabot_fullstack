import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Bot, MessageCircle, Lock, Zap, Sparkles, Shield, Users,
  BarChart3, Brain, Mail, Phone, MapPin, CheckCircle,
} from "lucide-react";
import { api } from "../lib/api";

export default function LandingPage() {
  const navigate = useNavigate();

  // Hero email capture
  const [heroEmail, setHeroEmail] = useState("");
  const [heroStatus, setHeroStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  async function handleHeroEmail() {
    if (!heroEmail.trim()) return;
    setHeroStatus("loading");
    try {
      await api.createLead(heroEmail, "hero");
      setHeroStatus("ok");
      setHeroEmail("");
    } catch {
      setHeroStatus("err");
    }
  }

  // Contact form
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  async function handleContactSubmit() {
    if (!form.email.trim() || !form.name.trim()) return;
    setFormStatus("loading");
    try {
      await api.createLead(form.email, "contact", {
        name: form.name, subject: form.subject, message: form.message,
      });
      setFormStatus("ok");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setFormStatus("err");
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#151525]">
      {/* ── Nav ── */}
      <section className="rounded-b-[28px] bg-[#fff5f1] px-6 py-5">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <Bot size={18} className="text-pink-500" />
            ClariBot
          </div>
          <div className="hidden gap-8 text-sm md:flex">
            <a href="#home" className="hover:text-pink-500 transition-colors">Home</a>
            <a href="#about" className="hover:text-pink-500 transition-colors">About</a>
            <a href="#features" className="hover:text-pink-500 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-pink-500 transition-colors">Pricing</a>
            <a href="#contact" className="hover:text-pink-500 transition-colors">Contact</a>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/demo-chat")}
              className="rounded-md border border-pink-200 px-5 py-2 text-sm hover:bg-pink-50 transition-colors"
            >
              Live demo
            </button>
            <button
              onClick={() => navigate("/login")}
              className="rounded-md bg-[#bd5b96] px-5 py-2 text-sm text-white hover:opacity-90 transition-opacity"
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <div id="home" className="mx-auto mt-16 max-w-6xl pb-16 md:grid md:grid-cols-2 md:gap-12 md:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-600">
              <Sparkles size={12} /> AI-powered customer support
            </div>
            <h1 className="text-5xl font-extrabold leading-tight md:text-6xl">
              Unleash the <br />Power of AI <br />
              <span className="text-[#ff715b]">Chatbot</span>
            </h1>

            <div className="mt-8 flex max-w-md overflow-hidden rounded-md border bg-white shadow-sm">
              <input
                value={heroEmail}
                onChange={e => setHeroEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleHeroEmail()}
                className="flex-1 px-4 py-3 text-sm outline-none"
                placeholder="Enter your email"
                type="email"
                disabled={heroStatus === "loading" || heroStatus === "ok"}
              />
              <button
                onClick={handleHeroEmail}
                disabled={heroStatus === "loading" || heroStatus === "ok"}
                className="bg-[#bd5b96] px-5 text-sm text-white hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {heroStatus === "loading" ? "…" : heroStatus === "ok" ? "✓ Sent!" : "Start Free Trial"}
              </button>
            </div>
            {heroStatus === "ok" && (
              <p className="mt-2 text-xs text-green-600 font-medium">Thanks! We'll be in touch soon.</p>
            )}
            {heroStatus === "err" && (
              <p className="mt-2 text-xs text-red-500">Something went wrong — please try again.</p>
            )}

            <div className="mt-5 flex flex-wrap gap-5 text-xs text-gray-500">
              <span>✅ Sign up for free</span>
              <span>✅ Free 14-day trial</span>
              <span>✅ No credit card required</span>
            </div>
          </div>

          <div className="hidden md:flex justify-center">
  <div className="w-80 h-80 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden"
    style={{ background: "linear-gradient(135deg,#7c3aed,#f97316)" }} >
    <img
      src="/robot.png"
      alt="AI Robot"
      className="h-full w-full object-cover"
    />
            </div>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="px-6 py-24">
        <div className="mx-auto max-w-6xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-pink-500">About</p>
          <h2 className="mb-6 text-4xl font-bold">What is ClariBot?</h2>
          <p className="mx-auto max-w-2xl text-gray-500 text-lg leading-relaxed">
            ClariBot is an AI-powered customer support platform that handles your support conversations 24/7.
            It learns from your business data, resolves common queries automatically, and escalates complex
            issues to your team — so your customers never wait.
          </p>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[["24/7", "Availability"], ["< 1s", "Response time"], ["94%", "Resolution rate"], ["5 ★", "Avg CSAT"]].map(([n, l]) => (
              <div key={l} className="rounded-2xl bg-[#fff5f1] p-6">
                <p className="text-3xl font-black text-pink-500">{n}</p>
                <p className="text-sm text-gray-500 mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-[#fff5f1] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-pink-500 text-center">Features</p>
          <h2 className="mb-12 text-4xl font-bold text-center">Everything you need</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Feature icon={<Brain size={22} />} title="Smart AI Replies" />
            <Feature icon={<Zap size={22} />} title="Instant Responses" />
            <Feature icon={<Shield size={22} />} title="Secure & Private" />
            <Feature icon={<Users size={22} />} title="Human Handoff" />
            <Feature icon={<BarChart3 size={22} />} title="Analytics Dashboard" />
            <Feature icon={<MessageCircle size={22} />} title="Multi-Channel Support" />
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-pink-500 text-center">Pricing</p>
          <h2 className="mb-12 text-4xl font-bold text-center">Simple, transparent plans</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Plan name="Starter" price="$0" onSignUp={() => navigate("/login")} />
            <Plan name="Growth" price="$99" highlighted onSignUp={() => navigate("/login")} />
            <Plan name="Enterprise" price="$299" onSignUp={() => navigate("/login")} />
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="bg-gradient-to-r from-[#75d4c8] to-[#e0528d] px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
          <div className="text-white">
            <p className="mb-3 text-sm uppercase font-semibold tracking-wider">Get in Touch</p>
            <h2 className="mb-6 text-4xl font-bold">Let&apos;s talk</h2>
            <p className="mb-8 text-white/80">Have questions about ClariBot? Send us a message and we'll get back to you within 24 hours.</p>
            <p className="mb-3 flex items-center gap-3"><Phone size={18} /> +1 234 567 890</p>
            <p className="mb-3 flex items-center gap-3"><Mail size={18} /> claribot@example.com</p>
            <p className="flex items-center gap-3"><MapPin size={18} /> Collins Street, Melbourne, Australia</p>
          </div>

          <div className="rounded-2xl bg-white/80 p-8 shadow-xl backdrop-blur">
            <h3 className="mb-6 text-2xl font-bold">Send a message</h3>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="mb-4 w-full border-b border-gray-200 bg-transparent py-3 outline-none text-sm focus:border-pink-400 transition-colors"
              placeholder="Your Name"
            />
            <input
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              type="email"
              className="mb-4 w-full border-b border-gray-200 bg-transparent py-3 outline-none text-sm focus:border-pink-400 transition-colors"
              placeholder="Your Email"
            />
            <input
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              className="mb-4 w-full border-b border-gray-200 bg-transparent py-3 outline-none text-sm focus:border-pink-400 transition-colors"
              placeholder="Subject"
            />
            <textarea
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              className="mb-6 w-full border-b border-gray-200 bg-transparent py-3 outline-none text-sm focus:border-pink-400 transition-colors resize-none"
              placeholder="Write your message…"
              rows={3}
            />

            {formStatus === "ok" ? (
              <div className="w-full rounded bg-green-500 py-3 text-white text-center font-semibold flex items-center justify-center gap-2">
                <CheckCircle size={16} /> Message sent! We'll reply soon.
              </div>
            ) : (
              <button
                onClick={handleContactSubmit}
                disabled={formStatus === "loading"}
                className="w-full rounded bg-[#bd5b96] py-3 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {formStatus === "loading" ? "Sending…" : "Send Message"}
              </button>
            )}
            {formStatus === "err" && (
              <p className="mt-2 text-xs text-red-500 text-center">Something went wrong. Please try again.</p>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-16 bg-[#151525] text-white">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-10 md:flex-row">
          <div>
            <h2 className="text-3xl font-bold mb-3">
              <span className="text-orange-400">Clari</span>
              <span className="text-pink-400">Bot</span>
            </h2>
            <p className="text-gray-400 text-sm max-w-xs">AI-powered customer support available 24/7.</p>
          </div>
          <div className="flex gap-16 text-sm">
            <div>
              <p className="font-semibold mb-3 text-gray-300">Product</p>
              <div className="flex flex-col gap-2 text-gray-400">
                <a href="#features" className="hover:text-white transition-colors">Features</a>
                <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                <button onClick={() => navigate("/demo-chat")} className="text-left hover:text-white transition-colors">Demo</button>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-3 text-gray-300">Company</p>
              <div className="flex flex-col gap-2 text-gray-400">
                <a href="#about" className="hover:text-white transition-colors">About</a>
                <a href="#contact" className="hover:text-white transition-colors">Contact</a>
                <button onClick={() => navigate("/admin-login")} className="text-left hover:text-white transition-colors">Admin</button>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-6xl mt-10 pt-6 border-t border-gray-700 text-xs text-gray-500">
          © 2026 ClariBot Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

// ── Helper components ─────────────────────────────────────────────────────────

function Feature({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow hover:shadow-md transition-shadow">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-500">
        {icon}
      </div>
      <h3 className="font-bold text-center">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 text-center">
        Powerful tools to improve customer support and business communication.
      </p>
    </div>
  );
}

function Plan({
  name, price, highlighted, onSignUp,
}: {
  name: string; price: string; highlighted?: boolean; onSignUp: () => void;
}) {
  return (
    <div className={`rounded-2xl p-8 text-left shadow-xl ${highlighted ? "bg-gradient-to-br from-orange-400 to-pink-500 text-white" : "bg-white"}`}>
      <h3 className="text-2xl font-bold">{name}</h3>
      <p className="my-5 text-5xl font-black">
        {price}<span className="text-base font-normal">/mo</span>
      </p>
      <button
        onClick={onSignUp}
        className={`mb-6 rounded px-6 py-3 font-semibold transition-opacity hover:opacity-90 ${highlighted ? "bg-white text-pink-500" : "bg-pink-500 text-white"}`}
      >
        {price === "$0" ? "Start Free" : "Sign Up Now"}
      </button>
      <ul className="space-y-3 text-sm">
        {price === "$0" && <>
          <li><CheckCircle size={16} className="mr-2 inline" /> 1,000 monthly conversations</li>
          <li><CheckCircle size={16} className="mr-2 inline" /> Basic AI response system</li>
          <li><CheckCircle size={16} className="mr-2 inline" /> Knowledge base setup</li>
          <li><CheckCircle size={16} className="mr-2 inline" /> Standard reporting</li>
        </>}
        {price === "$99" && <>
          <li><CheckCircle size={16} className="mr-2 inline" /> 20,000 monthly conversations</li>
          <li><CheckCircle size={16} className="mr-2 inline" /> Advanced AI + human handoff</li>
          <li><CheckCircle size={16} className="mr-2 inline" /> 5 channel integrations</li>
          <li><CheckCircle size={16} className="mr-2 inline" /> Analytics dashboard</li>
          <li><CheckCircle size={16} className="mr-2 inline" /> Priority support</li>
        </>}
        {price === "$299" && <>
          <li><CheckCircle size={16} className="mr-2 inline" /> Unlimited conversations</li>
          <li><CheckCircle size={16} className="mr-2 inline" /> Custom AI training</li>
          <li><CheckCircle size={16} className="mr-2 inline" /> Unlimited integrations</li>
          <li><CheckCircle size={16} className="mr-2 inline" /> SLA + dedicated manager</li>
          <li><CheckCircle size={16} className="mr-2 inline" /> White-label option</li>
        </>}
      </ul>
    </div>
  );
}
