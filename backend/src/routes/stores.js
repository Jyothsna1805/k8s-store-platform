import express from "express";
import { createStore, listStores, deleteStore } from "../db/storeRepo.js";
import { installStore } from "../services/helmService.js";

const router = express.Router();

/**
 * GET /stores
 */
router.get("/", (req, res) => {
  res.json(listStores());
});

/**
 * POST /stores
 */
router.post("/", async (req, res) => {
  const { name, engine } = req.body;

  const store = {
    id: Date.now().toString(),
    name,
    engine,
    status: "Provisioning",
    createdAt: new Date().toISOString()
  };

  createStore(store);

  installStore(store).catch(err => {
    store.status = "Failed";
    console.error("Provisioning failed:", err.message);
  });

  res.json(store);
});

/**
 * DELETE /stores/:id
 */
router.delete("/:id", async (req, res) => {
  const ok = deleteStore(req.params.id);
  res.json({ deleted: ok });
});

export default router;
