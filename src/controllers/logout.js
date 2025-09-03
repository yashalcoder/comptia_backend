const { pool } = require("../config/db");
const authMiddleware = require("../middleware/auth.js");

// Logout Controller
const logout = async (req, res) => {
  try {
    const { id: userId, device_id: deviceId } = req.user;

    if (!userId || !deviceId) {
      return res.status(400).json({ message: "Invalid user/device" });
    }

    // Remove mapping from device_user
    await pool.query(
      "DELETE FROM device_user WHERE user_id = $1 AND device_id = $2",
      [userId, deviceId]
    );

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = { logout, authMiddleware };
