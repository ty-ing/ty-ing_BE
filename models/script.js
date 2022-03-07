const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const { Schema } = mongoose;
const ScriptSchema = new Schema({
//   scriptId: {
//     type: Number,
//     require: true,
//   },

  scriptTitle: {
    type: String,
    require: true,
  },

  scriptTag: {
    type: Array,
    require: true,
  },

  scriptParagraph: {
    type: Array,
    require: true,
  },
});

ScriptSchema.plugin(AutoIncrement, { inc_field: "scriptId" });

module.exports = mongoose.model("Script", ScriptSchema);
