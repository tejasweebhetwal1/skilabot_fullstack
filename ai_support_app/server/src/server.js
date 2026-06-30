import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { readDb, updateDb } from "./store.js";
import { makeBotReply, classify } from "./bot.js";
import nodemailer from "nodemailer";

const app = express();
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

// ── Helpers ──────────────────────────────────────────────────────────────────

function tokenFor(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
}

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: "Invalid token" }); }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Admin only" });
  next();
}

// ── Health ────────────────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => res.json({ ok: true, app: "SkilaBot API" }));

// ── Auth ──────────────────────────────────────────────────────────────────────

app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password are required" });
  const result = await updateDb(async db => {
    if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) return { duplicate: true };
    const user = {
      id: nanoid(), name, email,
      passwordHash: await bcrypt.hash(password, 10),
      role: db.users.length === 0 ? "admin" : "user",
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    return { user };
  });
  if (result.duplicate) return res.status(409).json({ error: "Email already registered" });
  res.status(201).json({
    token: tokenFor(result.user),
    user: { id: result.user.id, name: result.user.name, email: result.user.email, role: result.user.role }
  });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  const db = await readDb();
  const user = db.users.find(u => u.email.toLowerCase() === String(email || "").toLowerCase());
  if (!user || !(await bcrypt.compare(password || "", user.passwordHash)))
    return res.status(401).json({ error: "Invalid email or password" });
  res.json({
    token: tokenFor(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

app.post("/api/auth/forgot", async (req, res) => {
  res.json({ ok: true, message: `Password reset link sent to ${req.body?.email || "that email"}` });
});

// ── Admin login (hardcoded credentials for demo) ──────────────────────────────

app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body || {};
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@claribot.com";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

  // Also allow DB users with role=admin
  const db = await readDb();
  const dbAdmin = db.users.find(
    u => u.email.toLowerCase() === String(email || "").toLowerCase() && u.role === "admin"
  );
  if (dbAdmin && (await bcrypt.compare(password || "", dbAdmin.passwordHash))) {
    return res.json({
      token: tokenFor(dbAdmin),
      user: { id: dbAdmin.id, name: dbAdmin.name, email: dbAdmin.email, role: "admin" }
    });
  }

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD)
    return res.status(401).json({ error: "Invalid admin credentials" });

  const token = jwt.sign({ email, role: "admin", name: "Admin" }, JWT_SECRET, { expiresIn: "1d" });
  res.json({ token, user: { id: "admin", name: "Admin", email, role: "admin" } });
});

// ── Conversations ─────────────────────────────────────────────────────────────

aapp.get("/api/admin/summary", auth, adminOnly, async (req, res) => {
  const db = await readDb();
  const convs = db.conversations
    .filter(c => c.userId === req.user.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  res.json(convs);
});

app.get("/api/admin/summary", auth, adminOnly, async (req, res) => {
  const conv = await updateDb(async db => {
    const c = {
      id: nanoid(),
      userId: req.user.id,
      title: req.body?.title || "New conversation",
      status: "open",
      sentiment: "neutral",
      messages: [{
        id: nanoid(), role: "bot",
        text: "Hello! 👋 I'm ClariBot, your AI support assistant. How can I help you today?",
        createdAt: new Date().toISOString()
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.conversations.push(c);
    return c;
  });
  res.status(201).json(conv);
});

aapp.get("/api/admin/summary", auth, adminOnly, async (req, res) => {
  await updateDb(async db => {
    const idx = db.conversations.findIndex(c => c.id === req.params.id && c.userId === req.user.id);
    if (idx !== -1) db.conversations.splice(idx, 1);
  });
  res.json({ ok: true });
});

// ── Chat ──────────────────────────────────────────────────────────────────────

app.get("/api/admin/summary", auth, adminOnly, async (req, res) => {
  const text = String(req.body?.message || "").trim();
  if (!text) return res.status(400).json({ error: "Message is required" });
  const conversationId = req.body?.conversationId;

  const result = await updateDb(async db => {
    let conv = db.conversations.find(c => c.id === conversationId && c.userId === req.user.id);
    if (!conv) {
      conv = {
        id: nanoid(), userId: req.user.id, title: text.slice(0, 42),
        status: "open", sentiment: "neutral", messages: [],
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      };
      db.conversations.push(conv);
    }
    const userMessage = { id: nanoid(), role: "user", text, createdAt: new Date().toISOString() };
    const reply = makeBotReply(text, db.settings || {});
    const botMessage = { id: nanoid(), role: "bot", text: reply, createdAt: new Date().toISOString() };
    const meta = classify(text);
  conv.intent = meta.intent;
    conv.messages.push(userMessage, botMessage);
    conv.status = meta.status;
    conv.sentiment = meta.sentiment;
    conv.intent = meta.intent || "general";
    conv.updatedAt = new Date().toISOString();
    if (!conv.title || conv.title === "New conversation") conv.title = text.slice(0, 42);
    return { conversation: conv, reply: botMessage };
  });
  res.json(result);
});

// ── Leads ─────────────────────────────────────────────────────────────────────

app.post("/api/leads", async (req, res) => {
  const { email, name = "", subject = "", message = "", source = "landing" } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email is required" });
  const lead = await updateDb(async db => {
    const item = { id: nanoid(), email, name, subject, message, source, createdAt: new Date().toISOString() };
    db.leads.push(item);
    return item;
  });
  res.status(201).json(lead);
});

// ── Admin routes ──────────────────────────────────────────────────────────────

app.get("/api/admin/summary", auth, adminOnly, async (_req, res) => {
  const db = await readDb();
  const conversations = db.conversations;
  const total = conversations.length;
  const escalated = conversations.filter(c => c.status === "escalated").length;
  const resolved = conversations.filter(c => c.status === "resolved").length;
  const open = conversations.filter(c => c.status === "open").length;

  // Sentiment breakdown
  const positive = conversations.filter(c => c.sentiment === "positive").length;
  const negative = conversations.filter(c => c.sentiment === "negative").length;
  const neutral = conversations.filter(c => c.sentiment === "neutral").length;

  res.json({
    totalConversations: total,
    resolved,
    escalated,
    open,
    leads: db.leads.length,
    users: db.users.length,
    resolutionRate: total ? Math.round((resolved / total) * 100) : 0,
    sentiment: { positive, neutral, negative },
    recentConversations: conversations
      .slice(-20).reverse()
      .map(c => ({
        id: c.id, title: c.title, status: c.status,
        sentiment: c.sentiment, updatedAt: c.updatedAt,
        userId: c.userId, messageCount: c.messages.length
      }))
  });
});

// All users (admin)
app.get("/api/admin/summary", auth, adminOnly, async (_req, res) => {
  const db = await readDb();
  res.json(db.users.map(u => ({
    id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt
  })));
});

// All leads (admin)
app.get("/api/admin/leads", auth, adminOnly, async (_req, res) => {
  const db = await readDb();
  res.json(db.leads);
});

// Export conversations as CSV
app.get("/api/admin/export", auth, adminOnly, async (_req, res) => {
  const db = await readDb();
  const rows = ["id,userId,title,status,sentiment,messages,createdAt,updatedAt"];
  for (const c of db.conversations) {
    rows.push([
      c.id, c.userId,
      `"${c.title.replace(/"/g, '""')}"`,
      c.status, c.sentiment, c.messages.length,
      c.createdAt, c.updatedAt
    ].join(","));
  }
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=conversations.csv");
  res.send(rows.join("\n"));
});
app.get("/api/admin/chat-logs", auth, adminOnly, async (_req, res) => {
  const db = await readDb();

  const logs = db.conversations.flatMap((conversation) =>
    conversation.messages.map((message) => ({
      conversationId: conversation.id,
      conversationTitle: conversation.title,
      userId: conversation.userId,
      status: conversation.status,
      sentiment: conversation.sentiment,
      intent: conversation.intent || "general",
      role: message.role,
      text: message.text,
      createdAt: message.createdAt,
    }))
  );

  res.json(logs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
});

// Get settings (admin)
app.get("/api/admin/settings", auth, adminOnly, async (_req, res) => {
  const db = await readDb();
  res.json(db.settings || {});
});

// Save settings (admin)
app.put("/api/admin/settings", auth, adminOnly, async (req, res) => {
  const updated = await updateDb(async db => {
    db.settings = { ...db.settings, ...req.body };
    return db.settings;
  });
  res.json(updated);
});

// Delete conversation (admin)
app.delete("/api/admin/conversations/:id", auth, adminOnly, async (req, res) => {
  await updateDb(async db => {
    const idx = db.conversations.findIndex(c => c.id === req.params.id);
    if (idx !== -1) db.conversations.splice(idx, 1);
  });
  res.json({ ok: true });
});

// Get single conversation with full messages (admin)
app.get("/api/admin/conversations/:id", auth, async (req, res) => {
  const db = await readDb();
  const conv = db.conversations.find(c => c.id === req.params.id);
  if (!conv) return res.status(404).json({ error: "Not found" });
  res.json(conv);
});

app.listen(PORT, () => console.log(`ClariBot API running on http://localhost:${PORT}`));