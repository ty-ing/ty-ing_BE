const mongoose = require("mongoose");

const mydictSchema = new mongoose.Schema({
  nickname: String,
  scriptId : String,
  word : String,
  sentence : String
});

module.exports = mongoose.model("Mydicts", mydictSchema);
