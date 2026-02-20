const express = require("express");
const path = require("path");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));


/* -------------------
2. Response time middleware
------------------- */
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const time = Date.now() - start;
    console.log(req.method, req.url, time + "ms");
  });

  next();
});


/* -------------------
1. Filter users by name
------------------- */

const users = [
  { name: "Anurag" },
  { name: "Rahul" },
  { name: "Amit" }
];

app.get("/users", (req, res) => {
  const name = req.query.name;

  let result = users;

  if (name) {
    result = users.filter(u =>
      u.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  res.json(result);
});


/* -------------------
3. Contact form
------------------- */

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.post("/contact", (req, res) => {
  res.send("Form submitted");
});


/* -------------------
5. Photo gallery
------------------- */

app.get("/gallery", (req, res) => {
  const photos = ["img1.jpg", "img2.jpg", "img3.jpg"];
  res.render("gallery", { photos });
});


/* -------------------
6. Simple blog
------------------- */

let posts = [
  { id: 1, title: "First Post", content: "Hello blog" }
];

app.get("/posts", (req, res) => {
  res.render("posts", { posts });
});

app.get("/posts/:id", (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  res.render("post", { post });
});

app.get("/new-post", (req, res) => {
  res.render("new-post");
});

app.post("/new-post", (req, res) => {
  const { title, content } = req.body;

  posts.push({
    id: posts.length + 1,
    title,
    content
  });

  res.redirect("/posts");
});


/* -------------------
4. Custom 404 page
------------------- */

app.use((req, res) => {
  res.status(404).render("404");
});


app.listen(3000, () => {
  console.log("Server started on 3000");
});
