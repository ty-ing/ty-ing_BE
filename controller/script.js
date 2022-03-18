const script = require("../models/script");
const Script = require("../models/script");

module.exports.findScript = async (req, res) => {
  const { scriptType, scriptCategory } = req.params;
  try {
    if (scriptType === "all" && scriptCategory === "all") {
      const script = await Script.aggregate([{ $sample: { size: 1 } }]);
      res.json({
        script,
        ok: true,
      });
    } else if (scriptCategory === "all" && scriptType !=="all")  {
      console.log(11)
      const script = await Script.aggregate([
        { $match: { scriptType: scriptType } },
        { $sample: { size: 1 } },
      ]);
      res.json({
        script,
        ok: true,
      });
    } else {
      const script = await Script.aggregate([
        { $match: { scriptType: scriptType, scriptCategory: scriptCategory } },
        { $sample: { size: 1 } },
      ]);
      res.json({
        script,
        ok: true,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(200).send({
      ok: false,
      errorMessage: "해당 값이 존재하지 않습니다.",
    });
  }
};

module.exports.scriptFilter = async (req, res) => {
  req.url;
  try {
    const scriptCategory = req.query.scriptCategory;
    const scriptTopic = req.query.scriptTopic;
    if (scriptCategory === "all" && scriptTopic === "all") {
      const scripts = await Script.find();
      res.json({
        scripts,
        ok: true,
      });
    } else if (scriptCategory === "all" && scriptTopic !=="all") {
      const scriptTopicList = scriptTopic.split("|")
      const scripts = await Script.find(
        { scriptTopic: { $in: scriptTopicList } },
      );
      res.json({
        scripts,
        ok: true,
      });
    } else if (scriptTopic === "all" && scriptCategory !== "all") {
    const scriptCategoryList = scriptCategory.split("|")
      const scripts = await Script.find(
         { scriptCategory: { $in:  scriptCategoryList } } 
      );
      res.json({
        scripts,
        ok: true,
      });
    } else {
        const scriptCategoryList = scriptCategory.split("|")
        const scriptTopicList = scriptTopic.split("|")
        const scripts = await Script.find(
          { scriptCategory: { $in: scriptCategoryList}, scriptTopic: { $in: scriptTopicList} },
     );
      res.json({
        scripts,
        ok: true,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(200).send({
      ok: false,
      errorMessage: "해당 값이 존재하지 않습니다.",
    });
  }
};

module.exports.searchScripts = async (req, res) => {
  const targetWord = await req.body.targetWord;
  const query = new RegExp(targetWord);
  try {
    const targetSentence = await Script.find({ scriptParagraph: query });
    console.log(targetSentence)

    if (!targetSentence.length) {
      throw "There is no proper data..";
    }

    res.json({
      targetScripts,
      ok: true,
    });
  } catch (err) {
    console.log(err);
    res.status(200).send({
      ok: false,
      errorMessage: "해당 값이 존재하지 않습니다.",
    });
  }
};

module.exports.scriptDetail = async (req, res) => {
  try {
    const scriptId = req.params;
    const script = await Script.findOne(scriptId);
    res.json({
      script,
      ok: true,
    });
  } catch (err) {
    console.log(err);
    res.status(200).send({
      ok: false,
      errorMessage: "해당 값이 존재하지 않습니다.",
    });
  }
};

Script.replaceOne;
