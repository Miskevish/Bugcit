// server/util.js
import rateLimit from "express-rate-limit";

export const chatBurstLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 20, // 20 mensajes por minuto por IP
  standardHeaders: true,
  legacyHeaders: false,
});
