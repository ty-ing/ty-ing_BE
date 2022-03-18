const Script = require("../models/script");

module.exports.findScript = async (req, res) => {
  const { scriptType, scriptCategory } = req.params;
  try {
    if (scriptType && scriptCategory === "all") {
      const script = await Script.aggregate([
        { $sample: { size: 1}},
      ]);
      res.json({
      script,
      ok: true,
    })
  } else if (scriptCategory === "all" ) {
      const script = await Script.aggregate([
        { $match: { scriptType: scriptType } },
        { $sample: { size: 1 } },
      ]);
      res.json({
        script,
        ok: true,
    })  
  } else {
   const script = await Script.aggregate([
    { $match: { scriptType: scriptType , scriptCategory: scriptCategory } },
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
    const scripts = await Script.aggregate([
      { $match: { scriptCategory: scriptCategory, scriptTopic: scriptTopic } },
    ]);
    res.json({
      scripts,
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

module.exports.searchScripts = async (req, res) => {
  const targetWord = await req.body.targetWord;
  const query = new RegExp(targetWord);
  try {
    const targetSentence = await Script.find({ scriptParagraph: query });

    if (!targetSentence.length) {
      throw "There is no proper data..";
    }

    res.json({
      targetSentence,
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
