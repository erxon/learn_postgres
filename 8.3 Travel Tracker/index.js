import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  password: "learnpg",
  database: "world",
  host: "localhost",
  port: 5432,
});

db.connect();

app.get("/", async (req, res) => {
  const result = await db.query("SELECT country_code FROM visited_countries");
  const countries = result.rows.map((item) => {
    return item.country_code
  });

  res.render("index.ejs", { countries: countries, total: result.rowCount });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
