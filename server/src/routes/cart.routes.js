import { Router } from "express";
import { carts, products } from "../data/store.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

function getUserCart(userId) {
  if (!carts.has(userId)) {
    carts.set(userId, []);
  }
  return carts.get(userId);
}

function buildCartResponse(items) {
  const enrichedItems = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return null;
      }
      return {
        productId: item.productId,
        quantity: item.quantity,
        product,
        lineTotal: Number((product.price * item.quantity).toFixed(2))
      };
    })
    .filter(Boolean);

  const total = enrichedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  return {
    items: enrichedItems,
    total: Number(total.toFixed(2))
  };
}

router.use(requireAuth);

router.get("/", (req, res) => {
  const cart = getUserCart(req.user.id);
  res.status(200).json(buildCartResponse(cart));
});

router.post("/items", (req, res) => {
  const { productId, quantity = 1 } = req.body || {};
  const id = Number(productId);
  const qty = Number(quantity);
  if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(qty) || qty <= 0) {
    return res.status(400).json({ message: "Valid productId and quantity required" });
  }

  const product = products.find((item) => item.id === id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const cart = getUserCart(req.user.id);
  const current = cart.find((item) => item.productId === id);
  if (current) {
    current.quantity += qty;
  } else {
    cart.push({ productId: id, quantity: qty });
  }

  res.status(200).json(buildCartResponse(cart));
});

router.patch("/items/:productId", (req, res) => {
  const id = Number(req.params.productId);
  const qty = Number(req.body?.quantity);
  if (!Number.isInteger(qty) || qty < 0) {
    return res.status(400).json({ message: "quantity must be >= 0" });
  }

  const cart = getUserCart(req.user.id);
  const item = cart.find((entry) => entry.productId === id);
  if (!item) {
    return res.status(404).json({ message: "Cart item not found" });
  }

  if (qty === 0) {
    const index = cart.findIndex((entry) => entry.productId === id);
    cart.splice(index, 1);
  } else {
    item.quantity = qty;
  }

  res.status(200).json(buildCartResponse(cart));
});

router.delete("/items/:productId", (req, res) => {
  const id = Number(req.params.productId);
  const cart = getUserCart(req.user.id);
  const index = cart.findIndex((item) => item.productId === id);
  if (index === -1) {
    return res.status(404).json({ message: "Cart item not found" });
  }
  cart.splice(index, 1);
  res.status(200).json(buildCartResponse(cart));
});

router.delete("/", (req, res) => {
  carts.set(req.user.id, []);
  res.status(200).json({ items: [], total: 0 });
});

export default router;
