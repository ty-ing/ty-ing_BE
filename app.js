require("dotenv").config(); // 환경변수
const passportConfig = require("./passport");
const express = require("express");
const app = express();
const port = 3000;

const connect = require("./models");
connect();

const cors = require("cors");

// const whitelist = ["http://localhost:3000"];
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not Allowed Origin!"));
//     }
//   },
// }; 
// app.use(cors(corsOptions));


app.use(cors());
passportConfig();

// const helmet = require("helmet");
// app.use(helmet());

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
app.use(express.static("views"));

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

const scriptRouter = require("./routes/script");
const usersRouter = require("./routes/users");
const opendictRouter = require("./routes/opendict_words");
const mydictRouter = require("./routes/mydict")


app.use("/api", [scriptRouter]);
app.use("/api", [usersRouter]);
app.use("/opendict", [opendictRouter]);
app.use("/mydict", [mydictRouter]);

app.get("/admin", (req, res) => {
  res.render("insert_Scripts.html");
});
app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
