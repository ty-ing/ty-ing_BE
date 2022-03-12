const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);

const OpendictSchema = new mongoose.Schema({
  nickname: String,
  scriptId: String,
  word: String,
  meaning : String,
  likeList : Array,
  dislikeList : Array,
  likeCount : Number,
  dislikeCount: Number,
});

OpendictSchema.plugin(AutoIncrement, { inc_field: "wordId" });
module.exports = mongoose.model("Opendicts", OpendictSchema);
