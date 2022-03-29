const Script = require("../models/script");

const { findByCategoryAndTopic, } = require("../lib/script/findByCategoryAndTopic");
const {findByCategoryAndType} = require("../lib/script/findByCategoryAndType"); 

//메인화면 랜덤한 스크립트 불러오기
module.exports.findScript = async (req, res) => {
  await findScript(req, res);
};

//스크립트 필터링 리스트 불러오기
module.exports.scriptFilter = async (req, res) => {
  await scriptFilter(req, res);
};

//스크립트 검색.
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
    console.error(err);
    res.status(200).send({
      ok: false,
      errorMessage: "해당 값이 존재하지 않습니다.",
    });
  }
}

async function searchScripts(req, res) {
  try {
    const page = parseInt(req.query.page);
    const perPage = 8
    const hideScript = (page - 1) * perPage;
    const userId = res.locals.user.id;
    console.log(res.locals.user.id)
    const targetWord = req.query.targetWord;
    const RegWord = new RegExp(targetWord, "gi");
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
      {
        $lookup: {
          from: "myscripts",
          localField: "scriptId",
          foreignField: "scriptId",
          pipeline: [
            { $match: { userId: userId } },
            {$addFields : {"exist" : "true"}},
            {
              $project: { _id: 0, userId: 0, scriptId: 0, __v: 0 },
            },

          ],
          as: "scripts",
        },
      },
    ])
      .sort({ _id: -1 })
      .skip(hideScript)
      .limit(perPage);

    const scriptAmount = await Script.aggregate([
      { $unwind: "$scriptParagraph" },
      { $match: { scriptParagraph: RegWord } },
      {
        $group: {
          _id: "$_id",
          scriptId: { $addToSet: "$scriptId" },
        },
      },
      { $count: "scriptId" },
    ]);
    if (!scriptAmount.length) {
      throw "There is no proper data..";
    }

    const totalScript = scriptAmount[0].scriptId;
    if (totalScript <= hideScript || totalScript == null) {
      res.json({
        ok: "no",
      });
    } else {
      res.json({
        targetScripts,
        ok: true,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(200).send({
      ok: false,
      errorMessage: "해당 값이 존재하지 않습니다.",
    });
  }
}

async function scriptFilter(req, res) {
  try {
    const page = parseInt(req.query.page);
    const scriptCategory = req.query.scriptCategory;
    const scriptTopic = req.query.scriptTopic;
    const isMyScript = req.query.myscript;
    const userId = res.locals.user.id;
    const perPage = 8;
    const hideScript = (page - 1) * perPage;

    const scripts = await findByCategoryAndTopic({
      scriptCategory,
      scriptTopic,
      isMyScript,
      userId,
      additionalStage: [
        { $sort: { _id: -1 } },
        { $skip: hideScript },
        { $limit: perPage },
      ],
    });

    const scriptAmount = await findByCategoryAndTopic({
      scriptCategory,
      scriptTopic,
      isMyScript,
      userId,
      additionalStage: [{ $count: "scriptId" }],
    });


    if (scriptAmount[0]){
      totalScript = scriptAmount[0].scriptId;
    } else {
      totalScript = 0;
    }

    if (totalScript === 0) {
      throw "값이 존재하지 않습니다."
    }

    if (totalScript <= hideScript || totalScript == null) {
      res.json({
        ok: "no",
      });
      return;
    }

    res.json({
      scripts,
      ok: true,
    });
  } catch (err) {
    console.error(err);
    res.status(200).send({
      ok: false,
      errorMessage: "해당 값이 존재하지 않습니다.",
    });
  }
}

async function findScript(req, res) {
  try {
    const { scriptType, scriptCategory } = req.params;

    const  script = await findByCategoryAndType({
      scriptCategory,
      scriptType,
    })
   
    res.json({
      script,
      ok:true,
    })
  } catch (err) {
    console.error(err);
    res.status(200).send({
      ok: false,
      errorMessage: "해당 값이 존재하지 않습니다.",
    });
  }
}
