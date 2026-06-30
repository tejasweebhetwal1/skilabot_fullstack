import { Outlet, NavLink, useLocation, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import {
  Bot,
  Menu,
  X,
  Home,
  MessageCircle,
  HelpCircle,
  Briefcase,
  LayoutDashboard,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { clearSession, getUser } from "../lib/api";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home },

  { to: "/faq", label: "FAQ", icon: HelpCircle },
  { to: "/business", label: "Business", icon: Briefcase },
  
];

export default function Root() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();

  // Pages that use their own nav (landing)
  const isLanding = location.pathname === "/";
  

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Landing page manages its own nav — just render children
  if (isLanding) return <Outlet />;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#fef0f5" }}>
      {/* Top nav */}
      <nav
        className="sticky top-0 z-40 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(254,240,245,0.95)" : "rgba(254,240,245,0.98)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(124,58,237,0.1)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7c3aed,#9d5cf5)" }}>
              <Bot size={16} color="#fff" />
            </div>
            <span className="font-bold text-lg" style={{ fontFamily: "var(--font-display)", color: "#12082a" }}>
              Clari<span style={{ color: "#7c3aed" }}>Bot</span>
            </span>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                style={({ isActive }) => ({
                  background: isActive ? "rgba(124,58,237,0.1)" : "transparent",
                  color: isActive ? "#7c3aed" : "#4a3060",
                  fontFamily: "var(--font-body)",
                })}
              >
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "rgba(124,58,237,0.08)" }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: "#7c3aed" }}>{(user?.name || "A").charAt(0).toUpperCase()}</div>
              <span className="text-sm font-medium" style={{ color: "#12082a", fontFamily: "var(--font-display)" }}>{user?.name || "Admin"}</span>
              <ChevronDown size={13} style={{ color: "#7c3aed" }} />
            </div>
            <button
              onClick={() => { clearSession(); navigate("/login"); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-red-50"
              style={{ color: "#ef4444", fontFamily: "var(--font-body)" }}
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-lg" onClick={() => setMobileOpen(v => !v)}>
            {mobileOpen ? <X size={20} style={{ color: "#12082a" }} /> : <Menu size={20} style={{ color: "#12082a" }} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t px-4 py-4 flex flex-col gap-1" style={{ borderColor: "rgba(124,58,237,0.1)", background: "rgba(254,240,245,0.98)" }}>
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium"
                style={({ isActive }) => ({
                  background: isActive ? "rgba(124,58,237,0.1)" : "transparent",
                  color: isActive ? "#7c3aed" : "#4a3060",
                  fontFamily: "var(--font-body)",
                })}
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
            <button
              onClick={() => { clearSession(); setMobileOpen(false); navigate("/login"); }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium mt-1"
              style={{ color: "#ef4444", fontFamily: "var(--font-body)" }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
