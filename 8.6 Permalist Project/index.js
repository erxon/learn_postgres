import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "learnpg",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function getItems() {
  const result = await db.query("SELECT * FROM items ORDER BY id ASC");
  const todo = result.rows.map((item) => {
    return item;
  });

  return todo;
}

app.get("/", async (req, res) => {
  const listItems = await getItems();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: listItems,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;

  try {
    await db.query("INSERT INTO items (title) VALUES ($1)", [item]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/edit", async (req, res) => {
  const updatedItemId = req.body.updatedItemId;
  const updatedItemTitle = req.body.updatedItemTitle;

  try {
    await db.query("UPDATE items SET title = $1 WHERE id = $2", [updatedItemTitle, updatedItemId] );
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/delete", async (req, res) => {
  const itemToDelete = req.body.deleteItemId;

  try {
    await db.query("DELETE FROM items WHERE id = $1", [itemToDelete]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
