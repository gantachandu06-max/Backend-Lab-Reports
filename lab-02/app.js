// Lab 2: Express server + SQLite database with CRUD routes
const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "books.db");
const PORT = process.env.PORT || 3000;
let db = null;

// Open the database first; start listening only if the connection works.
const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}/`);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// ---------- helpers ----------
const isPositiveInt = (v) => /^[1-9][0-9]*$/.test(String(v));

// returns an error message, or null when the body is a valid book
const checkBook = (body = {}) => {
  const { title, author, price, pages } = body;
  if (typeof title !== "string" || !title.trim()) return "title must be a non-empty string";
  if (typeof author !== "string" || !author.trim()) return "author must be a non-empty string";
  if (!Number.isInteger(price) || price < 0) return "price must be a non-negative integer";
  if (!Number.isInteger(pages) || pages < 1) return "pages must be a positive integer";
  return null;
};

// ---------- routes ----------

// 1. Get all books
app.get("/books/", async (request, response) => {
  try {
    const books = await db.all("SELECT * FROM book ORDER BY id;");
    response.status(200).send(books);
  } catch (e) {
    response.status(500).send({ error: "Internal Server Error" });
  }
});

// 2. Get one book
app.get("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  if (!isPositiveInt(bookId)) {
    return response.status(400).send({ error: "bookId must be a positive integer" });
  }
  try {
    const book = await db.get("SELECT * FROM book WHERE id = ?;", [bookId]);
    if (book === undefined) {
      return response.status(404).send({ error: "Book Not Found" });
    }
    response.status(200).send(book);
  } catch (e) {
    response.status(500).send({ error: "Internal Server Error" });
  }
});

// 3. Add a book
app.post("/books/", async (request, response) => {
  const problem = checkBook(request.body);
  if (problem) return response.status(400).send({ error: problem });

  const { title, author, price, pages } = request.body;
  try {
    const result = await db.run(
      "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);",
      [title, author, price, pages]
    );
    response.status(201).send({ message: "Book Added Successfully", bookId: result.lastID });
  } catch (e) {
    response.status(500).send({ error: "Internal Server Error" });
  }
});

// 4. Update a book
app.put("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  if (!isPositiveInt(bookId)) {
    return response.status(400).send({ error: "bookId must be a positive integer" });
  }
  const problem = checkBook(request.body);
  if (problem) return response.status(400).send({ error: problem });

  const { title, author, price, pages } = request.body;
  try {
    const result = await db.run(
      "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?;",
      [title, author, price, pages, bookId]
    );
    if (result.changes === 0) {
      return response.status(404).send({ error: "Book Not Found" });
    }
    response.status(200).send({ message: "Book Updated Successfully" });
  } catch (e) {
    response.status(500).send({ error: "Internal Server Error" });
  }
});

// 5. Delete a book
app.delete("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  if (!isPositiveInt(bookId)) {
    return response.status(400).send({ error: "bookId must be a positive integer" });
  }
  try {
    const result = await db.run("DELETE FROM book WHERE id = ?;", [bookId]);
    if (result.changes === 0) {
      return response.status(404).send({ error: "Book Not Found" });
    }
    response.status(200).send({ message: "Book Deleted Successfully" });
  } catch (e) {
    response.status(500).send({ error: "Internal Server Error" });
  }
});

// unknown routes
app.use((request, response) => {
  response.status(404).send({ error: "404 - Page Not Found" });
});

// bad JSON body and other errors
app.use((err, request, response, next) => {
  if (err.type === "entity.parse.failed") {
    return response.status(400).send({ error: "Invalid JSON body" });
  }
  response.status(500).send({ error: "Internal Server Error" });
});
