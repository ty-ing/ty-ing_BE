require('dotenv').config(); // 환경변수

const express = require("express");
const app = express();
const port = 3000;

const connect = require("./models");
connect();

const cors = require('cors');
app.use(cors());

//Request 로그 남기는 미들웨어
const requestMiddleware = (req, res, next) => {
  console.log(
    "Request URL:",
    req.originalUrl,
    " - ",
    new Date(+new Date() + 3240 * 10000)
      .toISOString()
      .replace("T", " ")
      .replace(/\..*/, "")
  );
  next();
};

app.use(requestMiddleware); // request log
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const scriptRouter = require("./routes/script");
const usersRouter = require("./routes/users");

app.use("/api", [scriptRouter]);
app.use("/api", [usersRouter]);

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
