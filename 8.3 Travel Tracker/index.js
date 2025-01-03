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
    return item.country_code;
  });

  res.render("index.ejs", { countries: countries, total: result.rowCount });
});

app.post("/add", async (req, res) => {
  const country = req.body.country;
  const result = await db.query(
    "SELECT country_code FROM world_countries WHERE country_name=$1",
    [country]
  );
  if (result.rowCount > 0) {
    const countryCode = result.rows[0].country_code;

    const insert = await db.query(
      "INSERT INTO visited_countries (country_code) VALUES ($1)",
      [countryCode]
    );
    res.redirect("/");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
