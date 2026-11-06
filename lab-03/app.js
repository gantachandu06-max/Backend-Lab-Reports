// Lab 3: REST API with search, sorting, pagination, price filter and validation
const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const { validateBook, isValidId, buildListQuery } = require("./validators");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "books.db");
const PORT = process.env.PORT || 3000;
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    const server = app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}/`);
    });
    // Debugging aid: tell the user clearly when the port is already taken.
    server.on("error", (e) => {
      if (e.code === "EADDRINUSE") {
        console.log(`Port ${PORT} is already in use. Stop the other process or set a different PORT.`);
      } else {
        console.log(`Server Error: ${e.message}`);
      }
      process.exit(1);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// All errors use the same shape: { "message": "..." }
const sendError = (response, status, message) => response.status(status).send({ message });

// ---------- routes (nouns in the path, the HTTP method is the action) ----------

// GET /books/?search_q=&order_by=&order=&limit=&offset=&min_price=&max_price=
app.get("/books/", async (request, response) => {
  const { error, sql, params } = buildListQuery(request.query);
  if (error) return sendError(response, 400, error);
  try {
    const books = await db.all(sql, params);
    response.status(200).send(books);
  } catch (e) {
    console.log(`GET /books/ failed: ${e.message}`);
    sendError(response, 500, "Internal Server Error");
  }
});

// GET /books/:bookId/
app.get("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  if (!isValidId(bookId)) return sendError(response, 400, "bookId must be a positive whole number");
  try {
    const book = await db.get("SELECT * FROM book WHERE id = ?;", [bookId]);
    if (book === undefined) return sendError(response, 404, "Book Not Found");
    response.status(200).send(book);
  } catch (e) {
    console.log(`GET /books/:bookId/ failed: ${e.message}`);
    sendError(response, 500, "Internal Server Error");
  }
});

// POST /books/
app.post("/books/", async (request, response) => {
  const problem = validateBook(request.body);
  if (problem) return sendError(response, 400, problem);

  const { title, author, price, pages } = request.body;
  try {
    const result = await db.run(
      "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);",
      [title.trim(), author.trim(), price, pages]
    );
    response.status(201).send({ message: "Book Added Successfully", bookId: result.lastID });
  } catch (e) {
    console.log(`POST /books/ failed: ${e.message}`);
    sendError(response, 500, "Internal Server Error");
  }
});

// PUT /books/:bookId/
app.put("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  if (!isValidId(bookId)) return sendError(response, 400, "bookId must be a positive whole number");
  const problem = validateBook(request.body);
  if (problem) return sendError(response, 400, problem);

  const { title, author, price, pages } = request.body;
  try {
    const result = await db.run(
      "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?;",
      [title.trim(), author.trim(), price, pages, bookId]
    );
    if (result.changes === 0) return sendError(response, 404, "Book Not Found");
    response.status(200).send({ message: "Book Updated Successfully" });
  } catch (e) {
    console.log(`PUT /books/:bookId/ failed: ${e.message}`);
    sendError(response, 500, "Internal Server Error");
  }
});

// DELETE /books/:bookId/
app.delete("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  if (!isValidId(bookId)) return sendError(response, 400, "bookId must be a positive whole number");
  try {
    const result = await db.run("DELETE FROM book WHERE id = ?;", [bookId]);
    if (result.changes === 0) return sendError(response, 404, "Book Not Found");
    response.status(200).send({ message: "Book Deleted Successfully" });
  } catch (e) {
    console.log(`DELETE /books/:bookId/ failed: ${e.message}`);
    sendError(response, 500, "Internal Server Error");
  }
});

// unknown routes
app.use((request, response) => {
  sendError(response, 404, "Route Not Found");
});

// invalid JSON body and any other error
app.use((err, request, response, next) => {
  if (err.type === "entity.parse.failed") return sendError(response, 400, "Invalid JSON body");
  console.log(`Unexpected error: ${err.message}`);
  sendError(response, 500, "Internal Server Error");
});
