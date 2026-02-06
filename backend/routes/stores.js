const express = require("express");
const router = express.Router();

const {
  createStore,
  deleteStore,
  listStores
} = require("../services/provisioner");

router.post("/", async (req, res) => {
  const { storeId } = req.body;

  if (!storeId) {
    return res.status(400).json({ error: "storeId required" });
  }

  const result = await createStore(storeId);
  res.json(result);
});

router.get("/", (req, res) => {
  res.json(listStores());
});

router.delete("/:storeId", (req, res) => {
  const result = deleteStore(req.params.storeId);
  res.json(result);
});

module.exports = router;
