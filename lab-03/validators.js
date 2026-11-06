// Validation and SQL-building helpers for Lab 3.
// Every value that comes from the user ends up in `params` (used with ? placeholders),
// never inside the SQL text. The only text placed in the SQL is picked from fixed whitelists.

const ALLOWED_ORDER_BY = ["id", "title", "author", "price", "pages"];
const MAX_LIMIT = 100;

const DEFAULTS = {
  search_q: "",
  order_by: "id",
  order: "ASC",
  limit: 10,
  offset: 0,
  min_price: 0,
};

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

// Parses "12" -> 12. Returns null for "", "abc", "1.5", "-3", arrays, etc.
const toWholeNumber = (v) => (typeof v === "string" && /^[0-9]+$/.test(v) ? Number(v) : null);

// ---------- POST / PUT body ----------
// returns an error message, or null when the body is a valid book
const validateBook = (body) => {
  if (body === undefined || body === null || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be a JSON object";
  }
  const { title, author, price, pages } = body;
  if (!isNonEmptyString(title)) return "title is required and must be a non-empty string";
  if (!isNonEmptyString(author)) return "author is required and must be a non-empty string";
  if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
    return "price is required and must be a non-negative number";
  }
  if (!Number.isInteger(pages) || pages < 1) {
    return "pages is required and must be a positive whole number";
  }
  return null;
};

// ---------- :bookId path parameter ----------
const isValidId = (v) => /^[1-9][0-9]*$/.test(String(v));

// ---------- GET /books/ query parameters ----------
// returns { error } or { sql, params }
const buildListQuery = (query = {}) => {
  // every query value must be a single string (rejects ?limit=1&limit=2)
  for (const [key, value] of Object.entries(query)) {
    if (typeof value !== "string") return { error: `${key} must be given only once and as plain text` };
  }

  const search_q = query.search_q !== undefined ? query.search_q.trim() : DEFAULTS.search_q;

  const order_by = query.order_by !== undefined ? query.order_by.toLowerCase() : DEFAULTS.order_by;
  if (!ALLOWED_ORDER_BY.includes(order_by)) {
    return { error: `order_by must be one of: ${ALLOWED_ORDER_BY.join(", ")}` };
  }

  const order = query.order !== undefined ? query.order.toUpperCase() : DEFAULTS.order;
  if (order !== "ASC" && order !== "DESC") return { error: "order must be ASC or DESC" };

  let limit = DEFAULTS.limit;
  if (query.limit !== undefined) {
    limit = toWholeNumber(query.limit);
    if (limit === null || limit < 1 || limit > MAX_LIMIT) {
      return { error: `limit must be a whole number from 1 to ${MAX_LIMIT}` };
    }
  }

  let offset = DEFAULTS.offset;
  if (query.offset !== undefined) {
    offset = toWholeNumber(query.offset);
    if (offset === null) return { error: "offset must be a whole number, 0 or more" };
  }

  let min_price = DEFAULTS.min_price;
  if (query.min_price !== undefined) {
    min_price = toWholeNumber(query.min_price);
    if (min_price === null) return { error: "min_price must be a whole number, 0 or more" };
  }

  let max_price = null; // no upper limit unless given
  if (query.max_price !== undefined) {
    max_price = toWholeNumber(query.max_price);
    if (max_price === null) return { error: "max_price must be a whole number, 0 or more" };
    if (max_price < min_price) return { error: "max_price must not be less than min_price" };
  }

  // Build the query. Only ? placeholders carry user data.
  const conditions = ["title LIKE ? ESCAPE '\\'", "price >= ?"];
  const escaped = search_q.replace(/[\\%_]/g, (c) => "\\" + c);
  const params = [`%${escaped}%`, min_price];
  if (max_price !== null) {
    conditions.push("price <= ?");
    params.push(max_price);
  }

  // order_by and order are safe to join: they were checked against fixed lists above.
  const sql =
    `SELECT * FROM book WHERE ${conditions.join(" AND ")} ` +
    `ORDER BY ${order_by} ${order}, id ASC LIMIT ? OFFSET ?;`;
  params.push(limit, offset);

  return { sql, params };
};

module.exports = { validateBook, isValidId, buildListQuery, ALLOWED_ORDER_BY, MAX_LIMIT };
