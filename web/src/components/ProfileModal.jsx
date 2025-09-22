import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";

const Field = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
}) => (
  <label className="form-field">
    <span>{label}</span>
    <input
      className="input"
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
    />
  </label>
);

export default function ProfileModal({ open, onClose }) {
  const { user, updateProfile, changePassword } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPass, setSavingPass] = useState(false);
  const [msgPass, setMsgPass] = useState("");
  const [errPass, setErrPass] = useState("");

  const dialogRef = useRef(null);

  // Sincroniza valores al abrir
  useEffect(() => {
    if (open && user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setMsg("");
      setErr("");
      setMsgPass("");
      setErrPass("");
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => {
        dialogRef.current?.querySelector("input")?.focus();
      }, 0);
    }
  }, [open, user]);

  // Cerrar con ESC / click afuera
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    const onClick = (e) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target))
        onClose?.();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, onClose]);

  const disabledSave = useMemo(() => {
    const changed =
      name !== (user?.name || "") || email !== (user?.email || "");
    return !changed || saving;
  }, [name, email, user, saving]);

  const onSaveProfile = async (e) => {
    e?.preventDefault();
    setMsg("");
    setErr("");
    setSaving(true);
    try {
      await updateProfile({ name, email });
      setMsg("Perfil actualizado ✨");
    } catch (e) {
      setErr(e.message || "No se pudo actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (e) => {
    e?.preventDefault();
    setMsgPass("");
    setErrPass("");
    setSavingPass(true);
    try {
      await changePassword(currentPassword, newPassword);
      setMsgPass("Contraseña actualizada ✅");
      setCurrentPassword("");
      setNewPassword("");
    } catch (e) {
      setErrPass(e.message || "No se pudo cambiar la contraseña.");
    } finally {
      setSavingPass(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div
        className="modal-card"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
      >
        <header className="modal-header">
          <div>
            <h3>Editar perfil</h3>
            <p className="muted">Actualiza tus datos o cambia la contraseña</p>
          </div>
          <button className="btn-ghost" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </header>

        <div className="modal-body">
          <section className="card section">
            <h4>Datos de cuenta</h4>
            <form onSubmit={onSaveProfile} className="form-grid">
              <Field
                label="Nombre"
                value={name}
                onChange={setName}
                placeholder="Tu nombre"
              />
              <Field
                label="Email"
                value={email}
                onChange={setEmail}
                placeholder="tucorreo@ejemplo.com"
                autoComplete="email"
              />
              {err && <p className="alert alert-error">{err}</p>}
              {msg && <p className="alert alert-ok">{msg}</p>}
              <div className="actions-right">
                <button className="btn" type="button" onClick={onClose}>
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  disabled={disabledSave}
                  type="submit"
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </section>

          <section className="card section">
            <h4>Cambiar contraseña</h4>
            <form onSubmit={onChangePassword} className="form-grid">
              <Field
                label="Contraseña actual"
                type="password"
                value={currentPassword}
                onChange={setCurrentPassword}
                autoComplete="current-password"
              />
              <Field
                label="Nueva contraseña (mín. 6)"
                type="password"
                value={newPassword}
                onChange={setNewPassword}
                autoComplete="new-password"
              />
              {errPass && <p className="alert alert-error">{errPass}</p>}
              {msgPass && <p className="alert alert-ok">{msgPass}</p>}
              <div className="actions-right">
                <button
                  className="btn btn-primary"
                  disabled={
                    savingPass || newPassword.length < 6 || !currentPassword
                  }
                >
                  {savingPass ? "Actualizando..." : "Cambiar contraseña"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
