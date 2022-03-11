const Script = require("../models/script");

module.exports.scriptsListId = async (req, res) => {
  try {
    const scriptListId = req.params;
    const scripts = await Script.find(scriptListId);
    if (scripts.length <= 0) {
      res.status(200).send({
        ok: false,
        errorMessage: "해당 값이 존재하지 않습니다.",
      });
    } else {
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

module.exports.scriptTag = async (req, res) => {
  try {
    const scriptTag = req.params;
    const scripts = await Script.find(scriptTag);
    if (scripts.length <= 0) {
      res.status(200).send({
        ok: false,

        errorMessage: "해당 값이 존재하지 않습니다.",
      });
    } else {
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
