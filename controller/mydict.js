const Mydict = require("../models/mydict");
const Opendict = require("../models/opendict");

// 나만의 단어장 등록하기
const postMydict = async (req, res) => {
  try {
    const nickname = res.locals.user.nickname;
    const id = res.locals.user.id;
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
    const findOpendictMeanings = await Opendict.find({
      scriptId,
      word,
    });

    if (!findOpendictMeanings.length) {
      return res.json({
        ok: false,
        errorMessage:
          "등록된 단어 뜻이 없습니다. 뜻을 추가하고 내 단어장에 저장해보세요.",
      });
    }

    // 나만의 단어장에 이미 등록된 단어인지 찾기
    const findMydictWord = await Mydict.findOne({
      nickname,
      scriptId,
      word,
    });

    // 나만의 단어장에 이미 등록한 단어일 때 등록 불가
    if (findMydictWord) {
      return res.json({
        ok: false,
        errorMessage: "나만의 단어장에 이미 등록한 단어입니다.",
      });
    }

    // 나만의 단어장 등록
    await Mydict.create({
      id,
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

// 나만의 단어장 단어(단어 뜻) 최신순 4개만 가져오기
const getMydictSome = async (req, res) => {
  try {
    const nickname = res.locals.user.nickname;

    // 나만의 단어장에서 등록한 단어 찾기
    const findMydictWords = await Mydict.aggregate([
      { $match: { nickname } },
      { $project: { _id: 0, nickname: 1, scriptId: 1, word: 1, sentence: 1 } },
    ]);

    // 나만의 단어장에 등록한 단어가 없을 때
    if (!findMydictWords.length) {
      return res.json({ ok: false, errorMessage: "등록한 단어가 없습니다." });
    }

    let mydictMeanings = await getMydictMeanings(req, res);
    mydictMeanings = mydictMeanings.reverse().slice(0, 4);

    res.json({
      ok: true,
      message: "나만의 단어장 단어 조회 성공",
      mydict: mydictMeanings,
    });
  } catch (error) {
    res.json({ ok: false, errorMessage: "나만의 단어장 단어 조회 실패" });
    console.error(`${error} 에러로 나만의 단어장 단어 조회 실패`);
  }
};

// 나만의 단어장 전체 단어(단어 뜻) 가져오기
const getMydictAll = async (req, res) => {
  try {
    const nickname = res.locals.user.nickname;

    // 나만의 단어장에서 등록한 단어 찾기
    const findMydictWords = await Mydict.aggregate([
      { $match: { nickname } },
      { $project: { _id: 0, nickname: 1, scriptId: 1, word: 1, sentence: 1 } },
    ]);

    // 나만의 단어장에 등록한 단어가 없을 때
    if (!findMydictWords.length) {
      return res.json({ ok: false, errorMessage: "등록한 단어가 없습니다." });
    }

    let mydictMeanings = await getMydictMeanings(req, res);
    mydictMeanings = mydictMeanings.reverse();

    res.json({
      ok: true,
      message: "나만의 단어장 단어 조회 성공",
      mydict: mydictMeanings,
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
    let { scriptId, word } = req.params;
    word = word.toLowerCase();

    const findMydictWord = await Mydict.findOne({
      nickname,
      scriptId,
      word,
    });

    // 나만의 단어장에 등록하지 않은 단어이거나, 이미 삭제 했을 때
    if (!findMydictWord) {
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

// function : 나만의 단어장 단어(단어 뜻)가져오기
async function getMydictMeanings(req, res) {
  const nickname = res.locals.user.nickname;

  // 나만의 단어장에서 등록한 단어 찾기
  const findMydictWords = await Mydict.aggregate([
    { $match: { nickname } },
    { $project: { _id: 0, nickname: 1, scriptId: 1, word: 1, sentence: 1 } },
  ]);

  // 나만의 단어장에 등록된 단어로 오픈사전 단어장에서 좋아요 1위 단어 찾기
  const findMostLikedMeaning = await Mydict.aggregate([
    { $match: { nickname } },
    {
      $lookup: {
        from: "opendicts",
        localField: "word",
        foreignField: "word",
        let: { scriptId: "$scriptId" },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$scriptId", ["$$scriptId"]] },
            },
          },
          {
            $project: {
              _id: 0,
              word: 1,
              meaning: 1,
              count: 1,
              nickname: 1,
              scriptId: 1,
            },
          },
          {
            $sort: { count: -1 },
          },
          {
            $group: {
              _id: "$word",
              meaning: { $first: "$meaning" },
            },
          },
        ],
        as: "meaning",
      },
    },
    {
      $project: {
        _id: 0,
        meaning: 1,
      },
    },
  ]);

  // 나만의 단어장에 등록된 단어로 오픈사전 단어장에서 내가 등록한 단어 찾기
  const findMydictWord = await Mydict.aggregate([
    { $match: { nickname } },
    {
      $lookup: {
        from: "opendicts",
        localField: "word",
        foreignField: "word",
        let: { scriptId: "$scriptId", nickname: "$nickname" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$scriptId", ["$$scriptId"]] },
                  { $in: ["$nickname", ["$$nickname"]] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 0,
              word: 1,
              meaning: 1,
              count: 1,
              nickname: 1,
              scriptId: 1,
            },
          },
          {
            $sort: { count: -1 },
          },
          {
            $group: {
              _id: "$word",
              meaning: { $first: "$meaning" },
            },
          },
        ],
        as: "meaning",
      },
    },
    {
      $project: {
        _id: 0,
        meaning: 1,
      },
    },
  ]);

  // 나만의 단어장에 찾은 단어 넣는 곳
  let mydictMeanings = [];

  // 나만의 단어장에 좋아요 1위 단어 넣기
  for (let mydictMeaning2 of findMostLikedMeaning) {
    let mostLikedMeaning = mydictMeaning2.meaning;
    mydictMeanings.push(mostLikedMeaning);
  }

  // 나만의 단어장에 내가 저장한 단어 넣기
  let idx = 0;
  for (let mydictMeaning2 of findMydictWord) {
    let myMeaning = mydictMeaning2.meaning;

    // 프론트로 정제해서 보내기
    // 내가 등록한 단어 뜻이 없을 때 빈 칸으로 넣어줌
    if (myMeaning.length === 0) {
      myMeaning = [{ meaning: "" }];
    }

    // 좋아요 1위 단어 뜻 옆에 넣기
    mydictMeanings[idx].push(
      ...myMeaning,
      findMydictWords[idx].word,
      findMydictWords[idx].sentence,
      findMydictWords[idx].scriptId
    );

    // 객체 분리해서 넣어주기
    if (mydictMeanings[idx][0] || mydictMeanings[idx][1]) {
      mydictMeanings[idx][0] = mydictMeanings[idx][0].meaning;
      mydictMeanings[idx][1] = mydictMeanings[idx][1].meaning;
    }

    idx++;
  }
  return mydictMeanings;
}

module.exports = {
  postMydict,
  getMydictSome,
  getMydictAll,
  deleteMydict,
};
