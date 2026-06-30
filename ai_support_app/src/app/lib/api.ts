const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:4000";

export type ApiUser = { id: string; name: string; email: string; role: string };
export type ApiMessage = { id: string; role: "user" | "bot"; text: string; createdAt: string };
export type ApiConversation = {
  id: string; title: string; status: string; sentiment: string;
  messages: ApiMessage[]; updatedAt: string; createdAt: string;
  userId?: string; messageCount?: number;
};
export type ApiSettings = {
  businessName?: string; escalationEmail?: string; botTone?: string;
  retentionDays?: number; confidenceThreshold?: number; maxTurns?: number; slackWebhook?: string;
};
export type ApiSummary = {
  totalConversations: number; resolved: number; escalated: number; open: number;
  leads: number; users: number; resolutionRate: number;
  sentiment: { positive: number; neutral: number; negative: number };
  recentConversations: ApiConversation[];
};

export function getToken() { return localStorage.getItem("skilabot_token"); }
export function getUser(): ApiUser | null {
  try { return JSON.parse(localStorage.getItem("skilabot_user") || "null"); } catch { return null; }
}
export function saveSession(token: string, user: ApiUser) {
  localStorage.setItem("skilabot_token", token);
  localStorage.setItem("skilabot_user", JSON.stringify(user));
}
export function clearSession() {
  localStorage.removeItem("skilabot_token");
  localStorage.removeItem("skilabot_user");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || "Request failed");
  return data as T;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: ApiUser }>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  signup: (name: string, email: string, password: string) =>
    request<{ token: string; user: ApiUser }>("/api/auth/signup", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  forgot: (email: string) =>
    request<{ ok: boolean; message: string }>("/api/auth/forgot", { method: "POST", body: JSON.stringify({ email }) }),
  adminLogin: (email: string, password: string) =>
    request<{ token: string; user: ApiUser }>("/api/admin/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  // Conversations
  conversations: () => request<ApiConversation[]>("/api/conversations"),
  newConversation: (title = "New conversation") =>
    request<ApiConversation>("/api/conversations", { method: "POST", body: JSON.stringify({ title }) }),
  deleteConversation: (id: string) =>
    request<{ ok: boolean }>(`/api/conversations/${id}`, { method: "DELETE" }),
  chat: (message: string, conversationId?: string | number) =>
    request<{ conversation: ApiConversation; reply: ApiMessage }>("/api/chat", {
      method: "POST", body: JSON.stringify({ message, conversationId })
    }),

  // Leads
  createLead: (email: string, source = "landing", extra?: Record<string, string>) =>
    request("/api/leads", { method: "POST", body: JSON.stringify({ email, source, ...extra }) }),

  // Admin
  adminSummary: () => request<ApiSummary>("/api/admin/summary"),
  adminUsers: () => request<ApiUser[]>("/api/admin/users"),
  adminLeads: () => request("/api/admin/leads"),
  adminExportUrl: () => `${API_BASE}/api/admin/export`,
  adminSettings: () => request<ApiSettings>("/api/admin/settings"),
  saveSettings: (settings: ApiSettings) =>
    request<ApiSettings>("/api/admin/settings", { method: "PUT", body: JSON.stringify(settings) }),
  adminDeleteConversation: (id: string) =>
    request<{ ok: boolean }>(`/api/admin/conversations/${id}`, { method: "DELETE" }),
  adminGetConversation: (id: string) =>
    request<ApiConversation>(`/api/admin/conversations/${id}`),
  adminChatLogs: () => request("/api/admin/chat-logs"),
  messageFeedback: (messageId: string | number, helpful: boolean) =>
  request<{ ok: boolean }>(`/api/messages/${messageId}/feedback`, {
    method: "POST",
    body: JSON.stringify({ helpful }),
  }),
};