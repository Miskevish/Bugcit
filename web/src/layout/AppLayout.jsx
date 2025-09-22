import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import ProfileModal from "../components/ProfileModal.jsx";

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
  const [showProfile, setShowProfile] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="app-wrap">
      {open && (
        <div className="drawer-backdrop" onClick={() => setOpen(false)} />
      )}

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
          {/* BLOQUE DE CUENTA — ahora es clickeable para editar */}
          <button
            className="account-block"
            onClick={() => setShowProfile(true)}
            title="Editar perfil"
          >
            <div className="account-avatar">B</div>
            <div className="account-info">
              <div className="account-name">{user?.name || "Cuenta"}</div>
              <div className="account-email">
                {user?.email ? `@${user.email}` : "@usuario"}
              </div>
            </div>
          </button>

          <button className="btn-ghost" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="app-content">
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

      {/* Modal de Perfil */}
      <ProfileModal open={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  );
}
