import React from "react";

export default function BugcitWidget() {
  return (
    <div
      className="fill"
      style={{ alignItems: "center", justifyContent: "center" }}
    >
      <div className="bugcit-bubble mb-2">Hola, tienes 3 tareas para hoy</div>
      <img
        src="/cat.png"
        alt="Bugcit Cat"
        style={{ width: "82%", maxWidth: 460, borderRadius: 12 }}
      />
    </div>
  );
}
