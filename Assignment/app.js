const express = require("express");
const app = express();

app.use(express.json());



let books = [
  { id: 1, title: "Clean Code", author: "Robert Martin", year: 2008 },
  { id: 2, title: "JavaScript Basics", author: "John", year: 2020 },
  { id: 3, title: "Node in Action", author: "Mike", year: 2019 }
];

let authors = [
  { id: 1, name: "Robert Martin" },
  { id: 2, name: "John" }
];



// Exercise 2
// Year validation middleware


function validateYear(req, res, next) {
  const { year } = req.body;

  if (year !== undefined) {
    const y = Number(year);

    if (isNaN(y) || y < 1500 || y > new Date().getFullYear()) {
      return res.status(400).json({
        message: "Invalid year"
      });
    }
  }

  next();
}



// Exercise 1 + 3
// GET all books
// filter by author/year


app.get("/books", (req, res) => {
  let result = [...books];

  const { author, year, page = 1, limit = 10 } = req.query;

  // filter
  if (author) {
    result = result.filter(b => b.author === author);
  }

  if (year) {
    result = result.filter(b => b.year == year);
  }

  // pagination
  const start = (page - 1) * limit;
  const end = start + Number(limit);

  const paginated = result.slice(start, end);

  res.json({
    total: result.length,
    page: Number(page),
    data: paginated
  });
});



// Create book (for testing middleware)


app.post("/books", validateYear, (req, res) => {
  const newBook = {
    id: books.length + 1,
    ...req.body
  };

  books.push(newBook);
  res.status(201).json(newBook);
});



// Exercise 5
// Search books by title


app.get("/books/search", (req, res) => {
  const { title } = req.query;

  if (!title) {
    return res.json([]);
  }

  const result = books.filter(b =>
    b.title.toLowerCase().includes(title.toLowerCase())
  );

  res.json(result);
});



// Exercise 4


// GET all authors
app.get("/authors", (req, res) => {
  res.json(authors);
});

// GET one author
app.get("/authors/:id", (req, res) => {
  const author = authors.find(a => a.id == req.params.id);

  if (!author) return res.status(404).json({ message: "Not found" });

  res.json(author);
});

// CREATE author
app.post("/authors", (req, res) => {
  const newAuthor = {
    id: authors.length + 1,
    name: req.body.name
  };

  authors.push(newAuthor);
  res.status(201).json(newAuthor);
});

// UPDATE author
app.put("/authors/:id", (req, res) => {
  const author = authors.find(a => a.id == req.params.id);

  if (!author) return res.status(404).json({ message: "Not found" });

  author.name = req.body.name;
  res.json(author);
});

// DELETE author
app.delete("/authors/:id", (req, res) => {
  const index = authors.findIndex(a => a.id == req.params.id);

  if (index === -1)
    return res.status(404).json({ message: "Not found" });

  authors.splice(index, 1);
  res.json({ message: "Deleted" });
});


app.listen(3000, () => {
  console.log("Server running on port 3000");
});
