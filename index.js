const { pool } = require('./src/config/db.js');
const app = require("./src/app.js");
const PORT = process.env.PORT || 3000;


pool.connect()
  .then(() => {
    console.log("✅ Connected to Supabase Postgres");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ DB connection error:", err);
    process.exit(1);
  });


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});