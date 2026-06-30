import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  Bot,
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
  Mail,
  Sparkles,
  ShieldCheck,
  User,
  Crown,
} from "lucide-react";
import { api, saveSession } from "../lib/api";

type Mode = "login" | "signup";
type LoginType = "customer" | "admin";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const forcedType = searchParams.get("type");
  const forcedMode = searchParams.get("mode");
  const isCustomerOnly = forcedType === "customer";

  const [mode, setMode] = useState<Mode>(forcedMode === "signup" ? "signup" : "login");
  const [loginType, setLoginType] = useState<LoginType>(forcedType === "admin" ? "admin" : "customer");
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (loginType === "admin") {
        const res = await fetch("http://localhost:4000/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || data.message || "Invalid admin login");
        }

        saveSession(data.token, data.user);
navigate("/admin-dashboard");
        return;
      }

      const session =
        mode === "signup"
          ? await api.signup(name, email, password)
          : await api.login(email, password);

      saveSession(session.token, session.user);
      navigate("/chat");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fff5f1]">
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-pink-300/40 blur-3xl" />
      <div className="absolute top-20 right-0 h-96 w-96 rounded-full bg-purple-400/30 blur-3xl" />
      <div className="absolute bottom-0 left-1/2 h-96 w-96 rounded-full bg-orange-300/40 blur-3xl" />

      <div className="relative grid min-h-screen lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 shadow-lg">
              <Bot size={24} color="#fff" />
            </div>
            <span className="text-3xl font-black text-[#151525]">
              Clari<span className="text-pink-500">Bot</span>
            </span>
          </div>

          <div className="max-w-lg">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-pink-600 shadow">
              <Sparkles size={15} />
              AI-powered customer support
            </div>

            <h1 className="mb-6 text-6xl font-black leading-tight text-[#151525]">
              Smarter login for <br />
              <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                customers & admins
              </span>
            </h1>

            <p className="mb-8 text-lg text-gray-600">
              Customers can access the chatbot. Admins can manage conversations,
              users, leads and analytics from one dashboard.
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white/80 p-5 shadow">
                <p className="text-2xl font-black text-pink-500">24/7</p>
                <p className="text-xs text-gray-500">Support</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-5 shadow">
                <p className="text-2xl font-black text-orange-400">AI</p>
                <p className="text-xs text-gray-500">Replies</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-5 shadow">
                <p className="text-2xl font-black text-purple-500">Admin</p>
                <p className="text-xs text-gray-500">Control</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400">© 2026 ClariBot Inc.</p>
        </div>

        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md rounded-[2rem] border border-white/60 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-400 to-pink-500 shadow-lg">
                {loginType === "admin" ? (
                  <Crown size={28} color="#fff" />
                ) : (
                  <Bot size={28} color="#fff" />
                )}
              </div>

              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-pink-600">
                <ShieldCheck size={13} />
                Secure Access
              </p>

              <h1 className="text-3xl font-black text-[#151525]">
                {loginType === "admin"
                  ? "Admin Login"
                  : mode === "signup"
                  ? "Create Account"
                  : "Customer Login"}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                {loginType === "admin"
                  ? "Manage ClariBot from your dashboard."
                  : "Sign in to continue using the chatbot."}
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 rounded-2xl bg-[#fff5f1] p-2">
              <button
                type="button"
                onClick={() => {
                  setLoginType("customer");
                  setMode("login");
                  setError("");
                }}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
                  loginType === "customer"
                    ? "bg-white text-pink-600 shadow"
                    : "text-gray-500 hover:text-pink-500"
                }`}
              >
                <User size={16} />
                Customer
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginType("admin");
                  setMode("login");
                  setError("");
                }}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
                  loginType === "admin"
                    ? "bg-white text-pink-600 shadow"
                    : "text-gray-500 hover:text-pink-500"
                }`}
              >
                <Crown size={16} />
                Admin
              </button>
            </div>

            {loginType === "customer" && (
              <p className="mb-5 text-center text-sm text-gray-600">
                {mode === "login"
                  ? "Don’t have an account? "
                  : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="font-bold text-pink-600 hover:underline"
                >
                  {mode === "login" ? "Sign up free" : "Sign in"}
                </button>
              </p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {loginType === "customer" && mode === "signup" && (
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-[#151525]">
                    Full name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-pink-400"
                    required
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-bold text-[#151525]">
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder={
                      loginType === "admin"
                        ? "admin@claribot.com"
                        : "you@example.com"
                    }
                    className="w-full rounded-2xl border bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-pink-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-[#151525]">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border bg-white py-3 pl-11 pr-12 text-sm outline-none transition focus:border-pink-400"
                    required
                    minLength={loginType === "admin" ? 1 : 6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-500">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 py-3.5 text-sm font-black text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-60"
              >
                {loading
                  ? "Please wait..."
                  : loginType === "admin"
                  ? "Login as Admin"
                  : mode === "signup"
                  ? "Create Customer Account"
                  : "Login as Customer"}
                <ArrowRight size={16} />
              </button>
            </form>

            <button
              onClick={() => navigate("/")}
              className="mt-6 w-full text-center text-sm font-semibold text-gray-500 hover:text-pink-500"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}