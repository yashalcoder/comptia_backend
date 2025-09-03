const express = require("express");
const authRoutes = require("./routes/auth.js");
const app = express();
app.use(express.json());

//routes
app.use("/auth", authRoutes);

module.exports = app;
