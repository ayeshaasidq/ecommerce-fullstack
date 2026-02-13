import { Router } from "express";
import { nextUserId, users } from "../data/store.js";
import { createSession, requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt
  };
}

router.post("/signup", (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "name, email and password are required" });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const exists = users.some((item) => item.email === normalizedEmail);
  if (exists) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const user = {
    id: nextUserId(),
    name: String(name).trim(),
    email: normalizedEmail,
    password: String(password),
    isAdmin: false,
    createdAt: new Date().toISOString()
  };

  users.push(user);
  const token = createSession(user.id);
  res.status(201).json({ user: toSafeUser(user), token });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const user = users.find((item) => item.email === normalizedEmail);
  if (!user || user.password !== String(password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = createSession(user.id);
  res.status(200).json({ user: toSafeUser(user), token });
});

router.get("/me", requireAuth, (req, res) => {
  res.status(200).json({ user: req.user });
});

export default router;
