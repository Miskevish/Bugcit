// web/src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await login(email, password);
      nav("/dashboard", { replace: true });
    } catch (e) {
      setErr(e.message || "Error al iniciar sesión");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h1>Inicia sesión</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {err && <div style={{ color: "tomato" }}>{err}</div>}
        <button className="btn brand" type="submit">
          Entrar
        </button>
      </form>
      <div style={{ marginTop: 8 }}>
        ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link>
      </div>
    </div>
  );
}
