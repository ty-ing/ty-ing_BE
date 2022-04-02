require("dotenv").config(); // 환경변수
const express = require("express");
const app = express();
const port = 3000;

const cors = require("cors");
const corsOption = {
  origin: ["https://ty-ing.com", `http://localhost:${port}`],
};
const helmet = require("helmet");
const hpp = require("hpp");
const connect = require("./models");
const passportConfig = require("./passport");

app.use(cors(corsOption));
app.use(helmet());
app.use(hpp());
connect();
passportConfig();

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
const opendictWordsRouter = require("./routes/opendict_words");
const opendictLikeDislikeRouter = require("./routes/opendict_likeDislike");
const mydictRouter = require("./routes/mydict")
const myScriptsRouter = require("./routes/myScripts")

app.use("/api", [scriptRouter]);
app.use("/api", [myScriptsRouter])
app.use("/api", [usersRouter]);
app.use("/opendict", [opendictWordsRouter]);
app.use("/likeDislike", [opendictLikeDislikeRouter]);
app.use("/mydict", [mydictRouter]);

app.get("/admin", (req, res) => {
  res.render("insert_Scripts.html");
});

// 상태검사용
app.get("/statusCheck", (req, res) => {
  res.send("healthy")
})

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});


