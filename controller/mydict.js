const Mydict = require("../models/mydict");
const Opendict = require("../models/opendict");

// 나만의 단어장 등록하기
const postMydict = async (req, res) => {
  try {
    const nickname = res.locals.user.nickname;
    let { scriptId, word } = req.params;
    const { sentence } = req.body;
    word = word.toLowerCase();

    // 단어를 입력하지 않았을 경우, 문장을 추가하지 않았을 때 단어 등록 불가
    if (!word || !sentence) {
      return res.json({
        ok: false,
        errorMessage: "단어를 입력하지 않았거나 문장을 추가하지 않았습니다.",
      });
    }

    // 오픈사전 단어장에 단어 뜻이 있는 경우만 나만의 단어장에 저장 가능
    const findOpendict = await Opendict.find({
      scriptId,
      word,
    });

    if (!findOpendict.length) {
      return res.json({
        ok: false,
        errorMessage:
          "등록된 단어 뜻이 없습니다. 뜻을 추가하고 내 단어장에 저장해보세요.",
      });
    }

    // 나만의 단어장에 이미 등록된 단어인지 찾기
    const findMydict = await Mydict.findOne({
      nickname,
      scriptId,
      word,
    });

    // 나만의 단어장에 이미 등록한 단어일 때 등록 불가
    if (findMydict) {
      return res.json({
        ok: false,
        errorMessage: "나만의 단어장에 이미 등록한 단어입니다.",
      });
    }

    // 나만의 단어장 등록
    await Mydict.create({
      nickname,
      scriptId,
      word,
      sentence,
    });

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

    // 나만의 단어장에서 등록한 단어 찾기
    const findMydict = await Mydict.aggregate([
      { $match: { nickname } },
      { $project: { _id: 0, nickname: 1, scriptId: 1, word: 1, sentence: 1 } },
    ]);

    // 나만의 단어장에 등록한 단어가 없을 때
    if (!findMydict.length) {
      return res.json({ ok: false, errorMessage: "등록한 단어가 없습니다." });
    }

    // 오픈사전 단어장에서 좋아요 1위 단어 뜻 가져오기
    let findOpendict = [];
    for (let mydict of findMydict) {
      const opendict = await findMostLikedMeaning(mydict);

      findOpendict.push(opendict);
    }

    // 오픈사전 단어장에서 내가 등록한 단어 찾아오기
    let idx = 0;
    for (let mydict of findMydict) {
      let opendict = await findMyMeaning(mydict, nickname);

      // 내가 등록한 단어가 없을 때 빈 칸으로 넣어줌
      if (opendict.length === 0) {
        opendict = [{ meaning: "" }];
      }

      // 좋아요 1위 단어 뜻 옆에 넣기
      findOpendict[idx].push(
        ...opendict,
        mydict.word,
        mydict.sentence,
        mydict.scriptId
      );

      // 객체 분리해서 넣어주기
      if (findOpendict[idx][0] || findOpendict[idx][1]) {
        findOpendict[idx][0] = findOpendict[idx][0].meaning;
        findOpendict[idx][1] = findOpendict[idx][1].meaning;
      }

      idx++;
    }

    res.json({
      ok: true,
      message: "나만의 단어장 단어 조회 성공",
      mydict: findOpendict.reverse(),
    });
  } catch (error) {
    res.json({ ok: false, errorMessage: "나만의 단어장 단어 조회 실패" });
    console.error(`${error} 에러로 나만의 단어장 단어 조회 실패`);
  }

  // function : 오픈사전 단어장에서 좋아요 1위 단어 뜻 찾아오기
  async function findMostLikedMeaning(mydict) {
    return await Opendict.aggregate([
      {
        $match: {
          scriptId: mydict.scriptId,
          word: mydict.word,
        },
      },
      {
        $project: {
          _id: 0,
          nickname: 1,
          word: 1,
          meaning: 1,
          count: 1,
        },
      },
      { $sort: { count: -1 } },
      {
        $group: {
          _id: "$word",
          meaning: { $first: "$meaning" },
        },
      }
    ]);
  }
};

// function : 오픈사전 단어장에서 내가 등록한 단어 뜻 찾아오기
async function findMyMeaning(mydict, nickname) {
  return await Opendict.aggregate([
    { $match: { scriptId: mydict.scriptId, word: mydict.word, nickname } },
    {
      $project: {
        _id: 0,
        nickname: 1,
        word: 1,
        meaning: 1,
      },
    },
    {
      $group: {
        _id: "$word",
        meaning: { $first: "$meaning" },
      },
    }
  ]);
}

// 나만의 단어장 단어 삭제하기
const deleteMydict = async (req, res) => {
  try {
    const nickname = res.locals.user.nickname;
    let { scriptId, word } = req.params;
    word = word.toLowerCase();

    const findMydict = await Mydict.findOne({
      nickname,
      scriptId,
      word,
    });

    // 나만의 단어장에 등록하지 않은 단어이거나, 이미 삭제 했을 때
    if (!findMydict) {
      return res.json({
        ok: false,
        errorMessage: "단어를 등록하지 않으셨거나 이미 단어를 삭제하셨습니다.",
      });
    }

    // 삭제
    await Mydict.deleteOne({
      nickname,
      word,
      scriptId,
      word,
    });

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
