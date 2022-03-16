const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);

const OpendictSchema = new mongoose.Schema({
  scriptId: String,
  word: String,
  meaning : String,
  nickname: String,
  likeList : Array,
  dislikeList : Array,
  likeCount : Number,
  dislikeCount: Number,
  count : Number
});

OpendictSchema.plugin(AutoIncrement, { inc_field: "wordId" });
module.exports = mongoose.model("Opendicts", OpendictSchema);
