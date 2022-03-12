const mydict = require("../models/mydict");
const Mydict = require("../models/mydict");
const opendict = require("../models/opendict");
const Opendict = require("../models/opendict");

// 나만의 단어장 등록하기
const postMydict = async (req, res) => {
  try {
    const nickname = res.locals.user.nickname;
    const { word } = req.body;

    const find = await Mydict.findOne({ nickname, word });

    // 이미 등록한 단어일 때 등록 불가
    if (find) {
      return res.json({
        ok: false,
        errorMessage: "나만의 단어장에 이미 등록한 단어입니다.",
      });
    }

    const findNickname = await Mydict.findOne({ nickname });

    if (findNickname) {
      await Mydict.updateOne({ nickname }, { $push: { word } });
    } else {
      await Mydict.create({ nickname, word });
    }

    res.json({ ok: true, message: "나만의 단어장 단어 등록 성공" });
  } catch (error) {
    res.json({ ok: false, errorMessage: "나만의 단어장 단어 등록 실패" });
    console.error(`${error} 에러로 나만의 단어장 단어 등록 실패`);
  }
};

// 나만의 단어장 전체 단어 가져오기
const getMydict = async (req, res) => {
  try {
    const nickname = res.locals.user.nickname;

    const find = await Mydict.findOne({ nickname });

    // 등록한 단어가 없을 때
    if (!find) {
      return res.json({ ok: false, errorMessage: "등록한 단어가 없습니다." });
    }

    // 단어 전체 가져오기
    let findOpendict = [];
    for (let i of find.word) {
      const opendict = await Opendict.aggregate([
        { $match: { word: i } },
        {
          $project: {
            _id: 0,
            nickname: 1,
            meaning: 1,
            likeCount: 1,
            dislikeCount: 1,
          },
        },
      ]);

      findOpendict.push(opendict);
    }

    // 좋아요 순으로 정렬
    let sortedOpendict = [];
    for (let i of findOpendict) {

      const sorted = i.sort(function (a, b) {
        if (a.likeCount - a.dislikeCount < b.likeCount - b.dislikeCount) {
          return 1;
        }
        if (a.likeCount - a.dislikeCount > b.likeCount - b.dislikeCount) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });

      sortedOpendict.push(sorted);
    }

    res.json({
      ok: true,
      message: "나만의 단어장 단어 조회 성공",
      word: find.word,
      mydict: sortedOpendict,
    });
  } catch (error) {
    res.json({ ok: false, errorMessage: "나만의 단어장 단어 조회 실패" });
    console.error(`${error} 에러로 나만의 단어장 단어 조회 실패`);
  }
};

// 나만의 단어장 단어 삭제하기
const deleteMydict = async (req, res) => {
  try {
    const nickname = res.locals.user.nickname;
    const { word } = req.body;

    const find = await Mydict.findOne({ nickname, word });

    if (!find) {
      return res.json({
        ok: false,
        errorMessage: "단어를 등록하지 않으셨거나 이미 단어를 삭제하셨습니다.",
      });
    }

    await Mydict.updateOne({ nickname, word }, { $pull: { word } });

    res.json({ ok: true, message: "나만의 단어장 단어 삭제 성공" });
  } catch (error) {
    res.json({ ok: false, errorMessage: "나만의 단어장 단어 삭제 실패" });
    console.error(`${error} 에러로 나만의 단어장 단어 삭제 실패`);
  }
};

module.exports = {
  postMydict,
  getMydict,
  deleteMydict,
};
