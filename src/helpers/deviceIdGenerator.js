const crypto = require("crypto");

function generateDeviceUUID(ip, userAgent) {
  return crypto.createHash("sha256").update(`${ip}-${userAgent}`).digest("hex");
}

module.exports = generateDeviceUUID;