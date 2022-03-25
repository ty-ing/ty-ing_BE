const mongoose = require("mongoose");


const myScriptsSchema = new mongoose.Schema({
    userId: Number,
    scriptId : Number,
})

module.exports = mongoose.model("MyScripts", myScriptsSchema);