import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

function MenuIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="app-wrap">
      {open && (
        <div className="drawer-backdrop" onClick={() => setOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">BUGCIT</div>

        <nav className="sidebar-body">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            onClick={() => setOpen(false)}
          >
            Panel de control
          </NavLink>
          <NavLink
            to="/calendar"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            onClick={() => setOpen(false)}
          >
            Calendario
          </NavLink>
          <NavLink
            to="/tasks"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            onClick={() => setOpen(false)}
          >
            Tareas
          </NavLink>
          <NavLink
            to="/notes"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            onClick={() => setOpen(false)}
          >
            Notas
          </NavLink>
          <NavLink
            to="/learning"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            onClick={() => setOpen(false)}
          >
            Aprendizaje
          </NavLink>
        </nav>

        <div className="sidebar-footer" style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                display: "grid",
                placeItems: "center",
                background: "#2a215f",
              }}
            >
              B
            </div>
            <div>
              <div style={{ fontWeight: 800 }}>{user?.name || "Cuenta"}</div>
              <div style={{ opacity: 0.7, fontSize: 12 }}>
                {user?.email ? `@${user.email}` : "@usuario"}
              </div>
            </div>
          </div>

          {/* Botón de cerrar sesión siempre visible */}
          <button className="btn-ghost" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO */}
      <main className="app-content">
        {/* Topbar móvil */}
        <div className="topbar">
          <button
            className="btn-ghost"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
          >
            <MenuIcon />
          </button>
          <div className="brand">BUGCIT</div>
          <div style={{ flex: 1 }} />
        </div>

        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
