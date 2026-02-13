import { Router } from "express";
import { nextProductId, products } from "../data/store.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/products", (_req, res) => {
  res.status(200).json({ count: products.length, products });
});

router.post("/products", (req, res) => {
  const { name, description, category, price, stock } = req.body || {};
  if (!name || !description || !category) {
    return res.status(400).json({
      message: "name, description and category are required"
    });
  }

  const parsedPrice = Number(price);
  const parsedStock = Number(stock);
  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ message: "price must be a valid positive number" });
  }
  if (!Number.isInteger(parsedStock) || parsedStock < 0) {
    return res.status(400).json({ message: "stock must be a valid integer >= 0" });
  }

  const product = {
    id: nextProductId(),
    name: String(name).trim(),
    description: String(description).trim(),
    category: String(category).toLowerCase().trim(),
    price: Number(parsedPrice.toFixed(2)),
    stock: parsedStock
  };
  products.push(product);
  res.status(201).json({ product });
});

router.patch("/products/:id", (req, res) => {
  const productId = Number(req.params.id);
  const product = products.find((item) => item.id === productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const allowed = ["name", "description", "category", "price", "stock"];
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      if (key === "price") {
        const parsedPrice = Number(req.body[key]);
        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
          return res.status(400).json({ message: "price must be a valid positive number" });
        }
        product.price = Number(parsedPrice.toFixed(2));
      } else if (key === "stock") {
        const parsedStock = Number(req.body[key]);
        if (!Number.isInteger(parsedStock) || parsedStock < 0) {
          return res.status(400).json({ message: "stock must be a valid integer >= 0" });
        }
        product.stock = parsedStock;
      } else if (key === "category") {
        product.category = String(req.body[key]).toLowerCase().trim();
      } else {
        product[key] = String(req.body[key]).trim();
      }
    }
  }

  res.status(200).json({ product });
});

router.delete("/products/:id", (req, res) => {
  const productId = Number(req.params.id);
  const index = products.findIndex((item) => item.id === productId);
  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }
  const [deleted] = products.splice(index, 1);
  res.status(200).json({ deleted });
});

export default router;
