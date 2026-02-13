import express from "express";
import cors from "cors";
import morgan from "morgan";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/products.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/orders.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({ message: "E-commerce API is running" });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

export default app;
