const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// GET / - welcome text
app.get("/", (req, res) => {
  res.status(200).send("Welcome to my Node.js and Express server!");
});

// GET /about - JSON containing name and section
app.get("/about", (req, res) => {
  res.status(200).json({
    name: "Your Name",
    section: "Your Section"
  });
});

// GET /time - current date and time
app.get("/time", (req, res) => {
  res.status(200).json({
    currentDateTime: new Date().toISOString()
  });
});

// 404 handler for any unknown path
app.use((req, res) => {
  res.status(404).json({
    error: "404 - Route not found",
    path: req.originalUrl
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
