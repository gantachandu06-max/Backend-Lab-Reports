-- Run in the SQLite CLI:  sqlite3 books.db < seed.sql
DROP TABLE IF EXISTS book;

CREATE TABLE book (
  id INTEGER PRIMARY KEY,
  title TEXT,
  author TEXT,
  price INTEGER,
  pages INTEGER
);

INSERT INTO book (title, author, price, pages) VALUES
  ('Train to Pakistan', 'Khushwant Singh', 240, 181),
  ('The White Tiger', 'Aravind Adiga', 320, 321),
  ('Malgudi Days', 'R.K. Narayan', 210, 256),
  ('Godan', 'Munshi Premchand', 190, 344),
  ('The Palace of Illusions', 'Chitra Banerjee Divakaruni', 399, 360),
  ('The God of Small Things', 'Arundhati Roy', 450, 340),
  ('Sapiens', 'Yuval Noah Harari', 550, 443),
  ('The Monk Who Sold His Ferrari', 'Robin Sharma', 280, 198),
  ('Think Like a Monk', 'Jay Shetty', 399, 320),
  ('The Discovery of India', 'Jawaharlal Nehru', 600, 592);
