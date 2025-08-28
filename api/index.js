const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Hello, Express from Vercel!');
});

// Export the app as a serverless function
module.exports = app;
