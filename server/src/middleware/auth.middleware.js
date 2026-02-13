import crypto from "crypto";
import { sessions, users } from "../data/store.js";

export function createSession(userId) {
  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, userId);
  return token;
}

export function requireAuth(req, res, next) {
  const authHeader = req.get("authorization") || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Missing or invalid auth token" });
  }

  const userId = sessions.get(token);
  if (!userId) {
    return res.status(401).json({ message: "Session not found or expired" });
  }

  const user = users.find((item) => item.id === userId);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  req.authToken = token;
  req.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin
  };
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}
