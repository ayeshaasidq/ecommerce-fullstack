import { Router } from "express";
import { carts, nextOrderId, orders, products } from "../data/store.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

function getCart(userId) {
  if (!carts.has(userId)) {
    carts.set(userId, []);
  }
  return carts.get(userId);
}

router.use(requireAuth);

router.get("/", (req, res) => {
  const mine = orders.filter((order) => order.userId === req.user.id);
  res.status(200).json({ count: mine.length, orders: mine });
});

router.post("/checkout", (req, res) => {
  const cart = getCart(req.user.id);
  if (cart.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const orderItems = cart.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return {
      productId: item.productId,
      name: product?.name || "Deleted product",
      price: product?.price || 0,
      quantity: item.quantity,
      lineTotal: Number(((product?.price || 0) * item.quantity).toFixed(2))
    };
  });

  const total = Number(
    orderItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)
  );
  const order = {
    id: nextOrderId(),
    userId: req.user.id,
    items: orderItems,
    total,
    status: "placed",
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  carts.set(req.user.id, []);
  res.status(201).json({ order });
});

router.get("/:id", (req, res) => {
  const orderId = Number(req.params.id);
  const order = orders.find((item) => item.id === orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  if (!req.user.isAdmin && order.userId !== req.user.id) {
    return res.status(403).json({ message: "Not allowed to access this order" });
  }
  res.status(200).json({ order });
});

export default router;
