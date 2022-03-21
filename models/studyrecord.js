const mongoose = require('mongoose');
const StudyrecordSchema = new mongoose.Schema({
  id: String,
  scriptId: Number,
  scriptTitle: String,
  time: Number,
  date: String,
  typingCnt: Number
});



module.exports = mongoose.model('Studyrecord', StudyrecordSchema);