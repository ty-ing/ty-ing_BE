const mongoose = require("mongoose");


const myScriptsSchema = new mongoose.Schema({
    userId: String,
    scriptId : Number,
})

module.exports = mongoose.model("MyScripts", myScriptsSchema);