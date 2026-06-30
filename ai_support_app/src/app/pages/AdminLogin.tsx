import { useState } from "react";

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@claribot.com");
  const [password, setPassword] = useState("admin123");
  const [message, setMessage] = useState("");

  async function handleLogin(e: { preventDefault: () => void; }) {
    e.preventDefault();

    const res = await fetch("http://localhost:4000/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Admin login failed");
      return;
    }

    localStorage.setItem("adminToken", data.token);
    setMessage("Admin login successful");
    window.location.href = "/admin-dashboard";
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <form onSubmit={handleLogin} style={{ width: 360, padding: 30, border: "1px solid #ddd", borderRadius: 12 }}>
        <h2>Admin Login</h2>

        <input
          style={{ width: "100%", padding: 12, marginBottom: 12 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Admin email"
        />

        <input
          style={{ width: "100%", padding: 12, marginBottom: 12 }}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        <button style={{ width: "100%", padding: 12 }} type="submit">
          Login as Admin
        </button>

        {message && <p>{message}</p>}
      </form>
    </div>
  );
}