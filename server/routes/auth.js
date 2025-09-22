import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const router = Router();

// Opciones de cookie consistentes para set y clear
const cookieOptionsBase = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.COOKIE_SECURE === "true", // en dev = false
  path: "/", // MUY importante para clear
  ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
};

function sendToken(res, user, status = 200) {
  const payload = { id: user._id, email: user.email, name: user.name };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });

  res
    .cookie("token", token, {
      ...cookieOptionsBase,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    })
    .status(status)
    .json({ user: payload });
}

// ---------- REGISTER ----------
router.post("/register", async (req, res) => {
  try {
    const body = req.body || {};
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password =
      typeof body.password === "string" ? body.password : undefined;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y password requeridos." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "La contraseña debe tener al menos 6 caracteres." });
    }

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ error: "Ese email ya está registrado." });

    const user = await User.create({ name, email, password });
    sendToken(res, user, 201);
  } catch (e) {
    console.error("Register error:", e, "body=", req.body);
    res.status(500).json({ error: "No se pudo registrar." });
  }
});

// ---------- LOGIN ----------
router.post("/login", async (req, res) => {
  try {
    const body = req.body || {};
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password =
      typeof body.password === "string" ? body.password : undefined;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y password requeridos." });
    }

    // traer hash explicitamente
    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res.status(401).json({ error: "Credenciales inválidas." });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas." });

    sendToken(res, user, 200);
  } catch (e) {
    console.error("Login error:", e, "body=", req.body);
    res.status(500).json({ error: "No se pudo iniciar sesión." });
  }
});

// ---------- LOGOUT ----------
router.post("/logout", (req, res) => {
  // Limpiar con EXACTAMENTE las mismas opciones (path/domain/secure/samesite)
  res.clearCookie("token", cookieOptionsBase);
  res.status(200).json({ ok: true });
});

// ---------- ME ----------
router.get("/me", (req, res) => {
  const token =
    (req.headers.authorization?.startsWith("Bearer ") &&
      req.headers.authorization.slice(7)) ||
    req.cookies?.token;

  if (!token) return res.json({ user: null });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({
      user: { id: payload.id, email: payload.email, name: payload.name },
    });
  } catch {
    return res.json({ user: null });
  }
});

export default router;
