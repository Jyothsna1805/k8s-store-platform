const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const storeRoutes = require("./routes/stores");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/stores", storeRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
