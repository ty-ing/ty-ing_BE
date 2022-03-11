const Script = require("../models/script");
module.exports.postScript = async (req, res) => {
    try {
       await Script.create({
          scriptTitle : req.body.scriptTitle,
          scriptCategory : req.body.scriptCategory,
          scriptTopic : req.body.scriptTopic.split(","),
          scriptParagraph : req.body.scriptParagraph.split("\n"),
          scriptSource : req.body.scriptSource
        });
      
        res.status(201).send({
          ok: true,
          message: "등록 완료",
        });
      } catch (err) {
        console.log(err);
        res.status(200).send({
          ok: false,
          errorMessage: "올바르지 않은 형식입니다.",
        });
      }
};
