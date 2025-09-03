const express = require("express");
const signup  = require("../controllers/signup.js");
const login  = require("../controllers/login.js")
const { logout, authMiddleware } = require("../controllers/logout.js");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);

module.exports = router;
