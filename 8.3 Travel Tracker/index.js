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

const checkVisited = async () => {
  const result = await db.query("SELECT country_code FROM visited_countries");
  const countries = result.rows.map((item) => {
    return item.country_code;
  });

  return countries;
};

app.get("/", async (req, res) => {
  const countries = await checkVisited();
  res.render("index.ejs", { countries: countries, total: countries.length });
});

app.post("/add", async (req, res) => {
  const country = req.body.country;
  try {
    const result = await db.query(
      "SELECT country_code FROM world_countries WHERE LOWER(country_name) LIKE '%' || $1 || '%'",
      [country.toLowerCase()]
    );

    const countryCode = result.rows[0].country_code;

    try {
      await db.query(
        "INSERT INTO visited_countries (country_code) VALUES ($1)",
        [countryCode]
      );
      res.redirect("/");
    } catch (error) {
      const countries = await checkVisited();
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country already added",
      });
    }
  } catch (error) {
    const countries = await checkVisited();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country does not exist",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
