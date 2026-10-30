// Task 3: Plain Node.js HTTP server (without Express)
const http = require("http");

const PORT = 3000;

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Hello");
  } else {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 - Route not found");
  }
});

server.listen(PORT, () => {
  console.log(`Plain HTTP server is running at http://localhost:${PORT}`);
});
