const now = Date.now();

export const products = [
  {
    id: 1,
    name: "Classic White Tee",
    description: "Soft cotton t-shirt for everyday wear.",
    category: "apparel",
    price: 19.99,
    stock: 50
  },
  {
    id: 2,
    name: "Wireless Earbuds",
    description: "Compact earbuds with charging case and clear sound.",
    category: "electronics",
    price: 59.99,
    stock: 35
  },
  {
    id: 3,
    name: "Running Shoes",
    description: "Lightweight running shoes with cushioned support.",
    category: "footwear",
    price: 89.99,
    stock: 20
  },
  {
    id: 4,
    name: "Stainless Bottle",
    description: "Insulated bottle that keeps drinks cold for hours.",
    category: "home",
    price: 24.5,
    stock: 40
  }
];

export const users = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    isAdmin: true,
    createdAt: new Date(now).toISOString()
  }
];

export const sessions = new Map();
export const carts = new Map();
export const orders = [];

let userIdSeq = users.length;
let productIdSeq = products.length;
let orderIdSeq = 0;

export function nextUserId() {
  userIdSeq += 1;
  return userIdSeq;
}

export function nextProductId() {
  productIdSeq += 1;
  return productIdSeq;
}

export function nextOrderId() {
  orderIdSeq += 1;
  return orderIdSeq;
}
console.log("Current Users:", users);
