const Mydict = require("../models/mydict");
const Opendict = require("../models/opendict");

// 나만의 단어장 등록하기
const postMydict = async (req, res) => {
  try {
    const nickname = res.locals.user.nickname;
    const { scriptId } = req.params;
    const { word, sentence } = req.body;

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
    const find = await Mydict.findOne({
      nickname,
      "mydict.scriptId": scriptId,
      "mydict.word": word,
    });

    // 나만의 단어장에 이미 등록한 단어일 때 등록 불가
    if (find) {
      return res.json({
        ok: false,
        errorMessage: "나만의 단어장에 이미 등록한 단어입니다.",
      });
    }

    // 나만의 단어장 등록
    await Mydict.create({
      nickname: nickname,
      mydict: { scriptId: scriptId, word: word, sentence: sentence },
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
    const find = await Mydict.aggregate([
      { $match: { nickname } },
      { $project: { _id: 0, nickname: 1, mydict: 1 } },
    ]);

    // 나만의 단어장에 등록한 단어가 없을 때
    if (!find.length) {
      return res.json({ ok: false, errorMessage: "등록한 단어가 없습니다." });
    }

    // 나만의 단어장에서 찾은 단어 리스트로 만들기
    let scriptId = [];
    let word = [];
    let sentence = []; // 문장 리스트
    for (let i of find) {
      scriptId.push(i.mydict.scriptId);
      word.push(i.mydict.word);
      sentence.push(i.mydict.sentence);
    }

    // 리스트를 통해서 오픈사전 단어장에서 전체 단어 찾아오기
    let findOpendict = [];
    for (let i = 0; i < word.length; i++) {
      const opendict = await Opendict.aggregate([
        { $match: { scriptId: scriptId[i], word: word[i] } },
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
        },
        {
          $project: {
            _id: 0,
            meaning: 1,
          },
        },
      ]);

      findOpendict.push(opendict);
    }

    // 리스트를 통해서 오픈사전 단어장에서 내가 등록한 단어 찾아오기
    let nicknameOpendict = [];
    for (let i = 0; i < word.length; i++) {
      const opendict = await Opendict.aggregate([
        { $match: { scriptId: scriptId[i], word: word[i], nickname } },
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
        },
        {
          $project: {
            _id: 0,
            meaning: 1,
          },
        },
      ]);

      nicknameOpendict.push(opendict);
    }

    res.json({
      ok: true,
      message: "나만의 단어장 단어 조회 성공",
      scriptId: scriptId,
      word: word,
      sentence: sentence,
      most_liked_meaning: findOpendict,
      meaning_added_by_me: nicknameOpendict,
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
    const { scriptId } = req.params;
    const { word } = req.body;

    const find = await Mydict.findOne({
      nickname,
      "mydict.scriptId": scriptId,
      "mydict.word": word,
    });

    // 등록하지 않은 단어이거나, 이미 삭제 했을 때
    if (!find) {
      return res.json({
        ok: false,
        errorMessage: "단어를 등록하지 않으셨거나 이미 단어를 삭제하셨습니다.",
      });
    }

    // 삭제
    await Mydict.deleteOne({
      nickname,
      word,
      "mydict.scriptId": scriptId,
      "mydict.word": word,
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
