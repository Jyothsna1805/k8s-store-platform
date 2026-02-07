const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

/**
 * Health check
 */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/**
 * In-memory store registry (temporary)
 * This will later map to real k8s state
 */
const stores = {};

/**
 * Create store (idempotent)
 */
app.post("/stores", async (req, res) => {
  const { storeId } = req.body;

  if (!storeId) {
    return res.status(400).json({ error: "storeId required" });
  }

  if (stores[storeId]) {
    return res.json({ status: "exists", storeId });
  }

  stores[storeId] = { status: "ready" };
  res.status(201).json({ status: "created", storeId });
});

/**
 * Place order
 */
app.post("/stores/:storeId/order", (req, res) => {
  const { storeId } = req.params;

  if (!stores[storeId]) {
    return res.status(404).json({ error: "store not found" });
  }

  res.json({ status: "order placed", storeId });
});

/**
 * Delete store (idempotent)
 */
app.delete("/stores/:storeId", (req, res) => {
  const { storeId } = req.params;

  if (!stores[storeId]) {
    return res.json({ status: "already deleted", storeId });
  }

  delete stores[storeId];
  res.json({ status: "deleted", storeId });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
