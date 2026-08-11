const express = require("express");
const cors = require("cors");

const cart = require("./api/cart");
const products = require("./api/products");
const users = require("./api/users");
const orders = require("./api/orders");

const app = express();

app.use(cors());
app.use(express.json());

// Users
app.post("/api/users/register", users.registerUser);
app.post("/api/users/login", users.loginUser);
app.get("/api/users/:id", users.getUser);
app.put("/api/users/:id", users.updateUser);
app.put("/api/users/:id/password", users.changePassword);
app.delete("/api/users/:id", users.deleteUser);

// Cart
app.get("/api/cart/:userId", cart.getCart);
app.get("/api/cart/:userId/summary", cart.getCartSummary);
app.post("/api/cart", cart.addToCart);
app.put("/api/cart/:cartId", cart.updateCartItem);
app.delete("/api/cart/:cartId", cart.removeCartItem);
app.delete("/api/cart/user/:userId", cart.clearCart);
app.delete("/api/cart/items", cart.removeSelectedItems);

// Orders
app.post("/api/orders", orders.createOrder);
app.get("/api/orders/user/:userId", orders.getOrdersByUser);
app.get("/api/orders/:orderId", orders.getOrderById);
app.put("/api/orders/:orderId", orders.updateOrder);

// Products
app.get("/api/products", products.getProducts);
app.get("/api/products/category/:categoryId", products.getProductsByCategory);
app.post("/api/products", products.addProduct);
app.put("/api/products/:id", products.updateProduct);
app.delete("/api/products/:id", products.deleteProduct);

app.get("/api/categories", products.getCategories);
app.post("/api/categories", products.addCategory);

app.get("/api/products/:productId/variants", products.getProductVariants);
app.post("/api/variants", products.addProductVariants);
app.put("/api/variants/:id", products.updateProductVariants);
app.delete("/api/variants/:id", products.deleteProductVariants);

app.get("/", (req, res) => {
  res.json({
    success: true,
    application: "MarioMart API",
    status: "Running"
  });
});

module.exports = app;