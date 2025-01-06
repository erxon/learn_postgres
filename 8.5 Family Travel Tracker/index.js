import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "learnpg",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;

async function checkVisisted(user) {
  const result = await db.query(
    "SELECT users.id, world_countries.country_code FROM visited_countries JOIN users ON users.id = visited_countries.user_id JOIN world_countries ON world_countries.id = visited_countries.country_id WHERE users.id=$1",
    [user]
  );
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

async function getUsers() {
  const result = await db.query("SELECT * FROM users");
  let users = [];
  result.rows.forEach((user) => {
    users.push(user);
  });
  return users;
}

async function getCurrentUser(userId) {
  const result = await db.query("SELECT * FROM users WHERE id=$1", [userId]);
  const user = result.rows[0];
  return user;
}

app.get("/", async (req, res) => {
  const countries = await checkVisisted(currentUserId);
  const users = await getUsers();
  const currentUser = await getCurrentUser(currentUserId);

  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: currentUser.color,
  });
});
app.post("/add", async (req, res) => {
  const input = req.body["country"];

  try {
    const result = await db.query(
      "SELECT id FROM world_countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    const data = result.rows[0];
    const countryId = data.id;

    try {
      await db.query(
        "INSERT INTO visited_countries (user_id, country_id) VALUES ($1, $2)",
        [currentUserId, countryId]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});
app.post("/user", async (req, res) => {
  if (req.body["add"]) {
    res.render("new.ejs");
  } else if (req.body["user"]) {
    currentUserId = req.body["user"];

    res.redirect("/");
  }
});

app.post("/new", async (req, res) => {
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html

  const name = req.body["name"];
  const color = req.body["color"];

  try {
    db.query("INSERT INTO users (name, color) VALUES ($1, $2)", [name, color]);
    const countries = await checkVisisted();
    const usersFromDB = await getUsers();

    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      users: usersFromDB,
      color: "teal",
    });
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
