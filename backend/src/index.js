import express from "express";
import cors from "cors";
import storesRouter from "./routes/stores.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/stores", storesRouter);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
