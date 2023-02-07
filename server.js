require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/auth");
const slabRouter = require("./routes/user-slab");
const rateRouter = require("./routes/user-rate");

const PORT = process.env.PORT || 5000;

const connectToMongo = require("./db");
connectToMongo();

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Billing app live");
});

app.use("/api/auth", authRouter);
app.use("/api/slab", slabRouter);
app.use("/api/rate", rateRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});
