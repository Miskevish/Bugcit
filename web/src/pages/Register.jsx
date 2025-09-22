// web/src/pages/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await register(name, email, password);
      nav("/dashboard", { replace: true });
    } catch (e) {
      setErr(e.message || "Error al registrar");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h1>Registro</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          className="input"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input"
          type="password"
          placeholder="Contraseña (min 6)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {err && <div style={{ color: "tomato" }}>{err}</div>}
        <button className="btn brand" type="submit">
          Crear cuenta
        </button>
      </form>
      <div style={{ marginTop: 8 }}>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </div>
    </div>
  );
}
