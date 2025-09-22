// server/routes/auth.js
import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();

function sendToken(res, user, status = 200) {
  const payload = { id: user._id, email: user.email, name: user.name };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });

  res
    .cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.COOKIE_SECURE === "true",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(status)
    .json({ user: payload });
}

router.post("/register", async (req, res) => {
  try {
    const { name = "", email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "Email y password requeridos." });
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ error: "Ese email ya está registrado." });
    const user = await User.create({ name, email, password });
    sendToken(res, user, 201);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "No se pudo registrar." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.compare(password))) {
      return res.status(401).json({ error: "Credenciales inválidas." });
    }
    sendToken(res, user, 200);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "No se pudo iniciar sesión." });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
  });
  res.json({ ok: true });
});

router.get("/me", (req, res) => {
  // si usas requireAuth aquí, te devolverá el payload
  const token = req.cookies?.token;
  if (!token) return res.json({ user: null });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: payload });
  } catch {
    res.json({ user: null });
  }
});

export default router;
