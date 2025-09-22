import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPass, setSavingPass] = useState(false);
  const [msgPass, setMsgPass] = useState(null);
  const [errPass, setErrPass] = useState(null);

  const onSaveProfile = async (e) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    setSaving(true);
    try {
      await updateProfile({ name, email });
      setMsg("Perfil actualizado.");
    } catch (e) {
      setErr(e.message || "No se pudo actualizar.");
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    setMsgPass(null);
    setErrPass(null);
    setSavingPass(true);
    try {
      await changePassword(currentPassword, newPassword);
      setMsgPass("Contraseña actualizada.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (e) {
      setErrPass(e.message || "No se pudo cambiar la contraseña.");
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 640 }}>
      <h2>Perfil</h2>

      <form onSubmit={onSaveProfile} className="form" style={{ gap: 12 }}>
        <label>Nombre</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
        />

        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="tucorreo@ejemplo.com"
        />

        {err && <p className="auth-error">{err}</p>}
        {msg && <p className="auth-ok">{msg}</p>}

        <button disabled={saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>

      <hr style={{ margin: "24px 0", opacity: 0.2 }} />

      <h3>Cambiar contraseña</h3>
      <form onSubmit={onChangePassword} className="form" style={{ gap: 12 }}>
        <label>Contraseña actual</label>
        <input
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
        />

        <label>Nueva contraseña (mín. 6)</label>
        <input
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          type="password"
          minLength={6}
          autoComplete="new-password"
        />

        {errPass && <p className="auth-error">{errPass}</p>}
        {msgPass && <p className="auth-ok">{msgPass}</p>}

        <button disabled={savingPass}>
          {savingPass ? "Actualizando..." : "Cambiar contraseña"}
        </button>
      </form>
    </div>
  );
}
