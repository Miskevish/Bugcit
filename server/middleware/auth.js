import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function auth(req, res, next) {
  try {
    const bearer = req.headers.authorization || "";
    const headerToken = bearer.startsWith("Bearer ") ? bearer.slice(7) : null;
    const cookieToken = req.cookies?.token || null;
    const token = headerToken || cookieToken;

    if (!token) return res.status(401).json({ error: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id || decoded._id).select(
      "-password"
    );
    if (!user) return res.status(401).json({ error: "Invalid user" });

    req.user = { id: user._id, email: user.email, name: user.name };
    next();
  } catch (e) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
