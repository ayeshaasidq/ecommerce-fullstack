import { useEffect, useMemo, useState } from "react";

const API_BASE = "https://ecommerce-fullstack-p4tm.onrender.com/api";



function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [adminForm, setAdminForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }),
    [token]
  );

  async function request(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }
    return data;
  }

  async function loadProducts() {
    setError("");
    try {
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (category) query.set("category", category.toLowerCase());
      if (minPrice) query.set("minPrice", minPrice);
      if (maxPrice) query.set("maxPrice", maxPrice);
      const qs = query.toString();
      const data = await request(`/products${qs ? `?${qs}` : ""}`);
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadCart() {
    if (!token) return;
    try {
      const data = await request("/cart", { headers: authHeaders });
      setCart(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadOrders() {
    if (!token) return;
    try {
      const data = await request("/orders", { headers: authHeaders });
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (!token) return;
    loadCart();
    loadOrders();
  }, [token]);

  async function signup(event) {
    event.preventDefault();
    setError("");
    try {
      const data = await request("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      setToken(data.token);
      setUser(data.user);
      setMessage("Signed up and logged in.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function login(event) {
    event.preventDefault();
    setError("");
    try {
      const data = await request("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      setToken(data.token);
      setUser(data.user);
      setMessage("Logged in.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function getMe() {
    if (!token) return;
    setError("");
    try {
      const data = await request("/auth/me", { headers: authHeaders });
      setUser(data.user);
    } catch (err) {
      setError(err.message);
    }
  }

  async function addToCart(productId) {
    if (!token) {
      setError("Login first to use cart.");
      return;
    }
    setError("");
    try {
      const data = await request("/cart/items", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ productId, quantity: 1 })
      });
      setCart(data);
      setMessage("Item added to cart.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateCartItem(productId, quantity) {
    setError("");
    try {
      const data = await request(`/cart/items/${productId}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ quantity })
      });
      setCart(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeCartItem(productId) {
    setError("");
    try {
      const data = await request(`/cart/items/${productId}`, {
        method: "DELETE",
        headers: authHeaders
      });
      setCart(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function checkout() {
    setError("");
    try {
      await request("/orders/checkout", {
        method: "POST",
        headers: authHeaders
      });
      setMessage("Checkout complete.");
      await loadCart();
      await loadOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  async function createProduct(event) {
    event.preventDefault();
    setError("");
    try {
      await request("/admin/products", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          ...adminForm,
          price: Number(adminForm.price),
          stock: Number(adminForm.stock)
        })
      });
      setAdminForm({
        name: "",
        description: "",
        category: "",
        price: "",
        stock: ""
      });
      setMessage("Product created.");
      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteProduct(productId) {
    setError("");
    try {
      await request(`/admin/products/${productId}`, {
        method: "DELETE",
        headers: authHeaders
      });
      setMessage("Product deleted.");
      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="page">
      <header className="hero">
        <h1>Workspace E-commerce</h1>
        <p>Full-stack starter with auth, products, cart, checkout, and admin APIs.</p>
      </header>

      {message ? <p className="notice success">{message}</p> : null}
      {error ? <p className="notice error">{error}</p> : null}

      <section className="card">
        <h2>Auth</h2>
        <div className="split">
          <form onSubmit={signup} className="stack">
            <h3>Signup</h3>
            <input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Create account</button>
          </form>

          <form onSubmit={login} className="stack">
            <h3>Login</h3>
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Login</button>
            <button type="button" onClick={getMe} disabled={!token}>
              /auth/me
            </button>
          </form>
        </div>
        <p className="small">
          Admin demo user: <code>admin@example.com</code> / <code>admin123</code>
        </p>
        <p className="small">Current user: {user ? `${user.name} (${user.email})` : "none"}</p>
      </section>

      <section className="card">
        <h2>Products</h2>
        <div className="filters">
          <input
            placeholder="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            placeholder="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <input
            placeholder="min price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            placeholder="max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
          <button type="button" onClick={loadProducts}>
            Search
          </button>
        </div>
        <ul className="list">
          {products.map((product) => (
            <li key={product.id}>
              <div>
                <strong>{product.name}</strong> (${product.price})
                <div className="small">
                  {product.category} | stock: {product.stock}
                </div>
              </div>
              <div className="row">
                <button type="button" onClick={() => addToCart(product.id)}>
                  Add to cart
                </button>
                {user?.isAdmin ? (
                  <button type="button" onClick={() => deleteProduct(product.id)}>
                    Delete
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Cart</h2>
        <ul className="list">
          {cart.items.map((item) => (
            <li key={item.productId}>
              <div>
                <strong>{item.product.name}</strong> x {item.quantity}
                <div className="small">line total: ${item.lineTotal}</div>
              </div>
              <div className="row">
                <button
                  type="button"
                  onClick={() => updateCartItem(item.productId, item.quantity + 1)}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateCartItem(item.productId, Math.max(0, item.quantity - 1))
                  }
                >
                  -
                </button>
                <button type="button" onClick={() => removeCartItem(item.productId)}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
        <p>Total: ${cart.total}</p>
        <button type="button" onClick={checkout} disabled={!cart.items.length}>
          Checkout
        </button>
      </section>

      <section className="card">
        <h2>Orders</h2>
        <ul className="list">
          {orders.map((order) => (
            <li key={order.id}>
              <div>
                <strong>Order #{order.id}</strong>
                <div className="small">
                  {order.items.length} items | ${order.total}
                </div>
              </div>
              <span className="small">{new Date(order.createdAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </section>

      {user?.isAdmin ? (
        <section className="card">
          <h2>Admin Product Create</h2>
          <form onSubmit={createProduct} className="stack">
            <input
              placeholder="name"
              value={adminForm.name}
              onChange={(e) =>
                setAdminForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <input
              placeholder="description"
              value={adminForm.description}
              onChange={(e) =>
                setAdminForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
            <input
              placeholder="category"
              value={adminForm.category}
              onChange={(e) =>
                setAdminForm((prev) => ({ ...prev, category: e.target.value }))
              }
            />
            <input
              placeholder="price"
              value={adminForm.price}
              onChange={(e) =>
                setAdminForm((prev) => ({ ...prev, price: e.target.value }))
              }
            />
            <input
              placeholder="stock"
              value={adminForm.stock}
              onChange={(e) =>
                setAdminForm((prev) => ({ ...prev, stock: e.target.value }))
              }
            />
            <button type="submit">Create Product</button>
          </form>
        </section>
      ) : null}
    </main>
  );
}

export default App;
