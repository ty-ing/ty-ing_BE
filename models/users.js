const mongoose = require('mongoose');
const UsersSchema = new mongoose.Schema({
  id: String,
  userId: Number,
  pwd: String,
  nickname: String,
  provider: String,
});



module.exports = mongoose.model('Users', UsersSchema);