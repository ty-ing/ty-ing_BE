const { number } = require("joi");
const mongoose = require("mongoose");

const mydictSchema = new mongoose.Schema({
  nickname: String,
  mydict : Object,
});

module.exports = mongoose.model("Mydicts", mydictSchema);
