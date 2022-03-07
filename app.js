const express = require("express");
const app = express();
const port = 5000;

const connect = require("./models");
connect();

const scriptRouter = require("./routes/script");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", [scriptRouter]);

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
