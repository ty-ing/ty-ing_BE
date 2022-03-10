require('dotenv').config(); // 환경변수

const express = require("express");
const app = express();
const port = 3000;

const connect = require("./models");
connect();

const cors = require('cors');
app.use(cors());

const helmet = require("helmet");
app.use(helmet());

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
app.use(express.static("views"))

 app.engine('html', require('ejs').renderFile);
 app.set('view engine', 'html');

const scriptRouter = require("./routes/script");
const usersRouter = require("./routes/users");
const opendictRouter = require("./routes/opendict_words");

app.use("/api", [scriptRouter]);
app.use("/api", [usersRouter]);
app.use("/opendict", [opendictRouter]);

app.get("/admin", (req, res ) => {
  res.render('insert_Scripts.html')

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
