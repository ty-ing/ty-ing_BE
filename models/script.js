const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const { Schema } = mongoose;
const ScriptSchema = new Schema({

  scriptTitle: { // 제목
    type: String,
    require: true,
  },

  scriptType: { // 종류(토플..아이엘츠..)
    type: String,
    require: true,
  },

  scriptCategory: {  // 카테고리(뉴욕타임즈, 대화문.)
    type: String,
    require: true,
  },

  scriptTopic  : { // 토픽 (스포츠..건강..)
      type: Array,
      require: true,
  },

  scriptParagraph: { //본문
    type: Array,
    require: true,
  },

  scriptTranslate: { //번역
    type: Array,
    require: true,
  },

  scriptSource: { //출처
    type: String,
    require: true,
  },
}); 

ScriptSchema.plugin(AutoIncrement, { inc_field: "scriptId" });

module.exports = mongoose.model("Script", ScriptSchema);
