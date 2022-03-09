require('dotenv').config(); // 환경변수

const express = require("express");
const app = express();
const port = 3000;

const connect = require("./models");
connect();

const scriptRouter = require("./routes/script");
const usersRouter = require("./routes/users");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", [scriptRouter]);
app.use("/api", [usersRouter]);

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
