const express = require("express");
const authRoutes = require("./routes/auth.js");
const app = express();
app.use(express.json());

// ✅ Health check route (for testing deployment)
app.get("/", (req, res) => {
  res.send("🚀 Backend successfully deployed on Vercel!");
});
//routes
app.use("/auth", authRoutes);

module.exports = app;
