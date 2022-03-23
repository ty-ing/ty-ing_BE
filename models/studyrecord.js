const mongoose = require('mongoose');
const AutoIncrement = require("mongoose-sequence")(mongoose);
const StudyrecordSchema = new mongoose.Schema({
  id: String,
  scriptId: Number,
  duration: Number,
  date: Date,
  typingCnt: Number,
  time: String,
  datestring: String,
  progress: String,
  speed: String
});


StudyrecordSchema.plugin(AutoIncrement, { inc_field: "certificateId" });
module.exports = mongoose.model('Studyrecord', StudyrecordSchema);