const Script = require("../models/script");

//메인화면 랜덤한 스크립트 불러오기
module.exports.findScript = async (req, res) => {
  await findScript(req, res);
};

//스크립트 필터링 리스트 불러오기
module.exports.scriptFilter = async (req, res) => {
  await scriptFilter(req, res);
};

//스크립트 검색
module.exports.searchScripts = async (req, res) => {
  await searchScripts(req, res);
};

//스크립트 상세페이지
module.exports.scriptDetail = async (req, res) => {
  await scriptDetail(req, res);
};

async function scriptDetail(req, res) {
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
}

async function searchScripts(req, res) {
  const paramWord = req.params; //
  const targetWord = paramWord.targetWord;
  const RegWord = new RegExp(targetWord, "gi");
  try {
    const targetScripts = await Script.aggregate([
      { $unwind: "$scriptParagraph" },
      { $match: { scriptParagraph: RegWord } },
      {
        $group: {
          _id: "$_id",
          scriptTitle: { $addToSet: "$scriptTitle" },
          scriptType: { $addToSet: "$scriptType" },
          scriptCategory: { $addToSet: "$scriptCategory" },
          scriptTopic: { $addToSet: "$scriptTopic" },
          scriptParagraph: { $addToSet: "$scriptParagraph" },
          scriptId: { $addToSet: "$scriptId" },
        },
      },
    ]);

    if (!targetScripts.length) {
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
}

async function scriptFilter(req, res) {
  try {
    const page = parseInt(req.query.page)
    const hideScript = ((page - 1) * 8)
    const scriptCategory = req.query.scriptCategory;
    const scriptTopic = req.query.scriptTopic;
    switch (true) {
      case scriptCategory === "all" && scriptTopic === "all": {
        if (Script.countDocuments < hideScript || Script.countDocuments == null) {
          throw err
        } else{
        const scripts = await Script.find().sort({_id : 1}).skip(hideScript).limit(8)
        console.log(page)
        console.log(hideScript)
        res.json({
          scripts,
          ok: true,
        });
        break;
      }
      }
      case scriptTopic === "all" && scriptCategory !== "all": {
        const scriptCategoryList = scriptCategory.split("|");
        const scripts = await Script.find({
          scriptCategory: { $in: scriptCategoryList },
        });
        res.json({
          scripts,
          ok: true,
        });
        break;
      }
      case scriptTopic !== "all" && scriptCategory === "all": {
        const scriptTopicList = scriptTopic.split("|");
        const scripts = await Script.find({
          scriptTopic: { $in: scriptTopicList },
        });
        res.json({
          scripts,
          ok: true,
        });
        break;
      }
      case scriptCategory !== "all" && scriptTopic !== "all": {
        const scriptCategoryList = scriptCategory.split("|");
        const scriptTopicList = scriptTopic.split("|");
        const scripts = await Script.aggregate([
          {
            $match: {
              $or: [
                { scriptCategory: { $in: scriptCategoryList } },
                { scriptTopic: { $in: scriptTopicList } },
              ],
            },
          },
        ]);
        res.json({
          scripts,
          ok: true,
        });
        break;
      }
    }
  } catch (err) {
    console.log(err);
    res.status(200).send({
      ok: false,
      errorMessage: "해당 값이 존재하지 않습니다.",
    });
  }
}

async function findScript(req, res) {
  try {
    const { scriptType, scriptCategory } = req.params;
    switch (true) {
      case scriptType === "all" && scriptCategory === "all":
        {
          const script = await Script.aggregate([{ $sample: { size: 1 } }]);
          res.json({
            script,
            ok: true,
          });
        }
        break;
      case scriptCategory === "all" && scriptType !== "all":
        {
          const script = await Script.aggregate([
            { $match: { scriptType: scriptType } },
            { $sample: { size: 1 } },
          ]);
          res.json({
            script,
            ok: true,
          });
        }
        break;
      case scriptCategory !== "all" && scriptType !== "all":
        {
          const script = await Script.aggregate([
            {
              $match: {
                scriptType: scriptType,
                scriptCategory: scriptCategory,
              },
            },
            { $sample: { size: 1 } },
          ]);
          res.json({
            script,
            ok: true,
          });
        }
        break;
    }
  } catch (err) {
    console.log(err);
    res.status(200).send({
      ok: false,
      errorMessage: "해당 값이 존재하지 않습니다.",
    });
  }
}
