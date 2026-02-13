import { Router } from "express";
import { products } from "../data/store.js";

const router = Router();

function toPrice(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

router.get("/", (req, res) => {
  const { search, category, minPrice, maxPrice } = req.query;
  const min = toPrice(minPrice);
  const max = toPrice(maxPrice);

  const result = products.filter((item) => {
    const q = String(search || "").toLowerCase().trim();
    const categoryMatch = category
      ? item.category === String(category).toLowerCase()
      : true;
    const searchMatch = q
      ? item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      : true;
    const minMatch = min !== null ? item.price >= min : true;
    const maxMatch = max !== null ? item.price <= max : true;
    return categoryMatch && searchMatch && minMatch && maxMatch;
  });

  res.status(200).json({ count: result.length, products: result });
});

router.get("/:id", (req, res) => {
  const productId = Number(req.params.id);
  const product = products.find((item) => item.id === productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.status(200).json({ product });
});

export default router;
