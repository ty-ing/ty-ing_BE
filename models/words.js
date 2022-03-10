const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);

const WordsSchema = new mongoose.Schema({
  nickname: String,
  scriptId: String,
  word: String,
  meaning : String,
});

module.exports = mongoose.model("Words", WordsSchema);
