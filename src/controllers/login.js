const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
const generateDeviceUUID = require("../helpers/deviceIdGenerator.js");


const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // 1. Find user
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const user = userResult.rows[0];

    // 2. Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Generate device info
    const ip = req.ip || req.connection.remoteAddress || "unknown_ip";
    const userAgent = req.headers["user-agent"] || "unknown_device";
    const deviceUUID = generateDeviceUUID(ip, userAgent);

    // 4. Check if device exists
    let deviceResult = await pool.query(
      "SELECT * FROM devices WHERE device_uuid = $1",
      [deviceUUID]
    );

    let deviceId;
    if (deviceResult.rows.length === 0) {
      // Insert new device
      const insertDevice = await pool.query(
        `INSERT INTO devices (device_uuid, device_type, ip, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id`,
        [deviceUUID, userAgent, ip]
      );
      deviceId = insertDevice.rows[0].id;
    } else {
      deviceId = deviceResult.rows[0].id;
    }

    // 5. Check user's devices
    const deviceUserResult = await pool.query(
      "SELECT * FROM device_user WHERE user_id = $1",
      [user.id]
    );

    const alreadyLinked = deviceUserResult.rows.find(d => d.device_id === deviceId);

    if (!alreadyLinked && deviceUserResult.rows.length >= 3) {
      return res.status(403).json({
        message: "Device limit reached. You can only connect up to 3 devices.",
      });
    }

    // 6. Link device to user if not already linked
    if (!alreadyLinked) {
      await pool.query(
        `INSERT INTO device_user (user_id, device_id, verified_at, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW(), NOW())`,
        [user.id, deviceId]
      );
    }

    // 7. Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, device_id: deviceId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email, name: user.name },
      device: { deviceId, ip, userAgent, deviceUUID },
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = login ;