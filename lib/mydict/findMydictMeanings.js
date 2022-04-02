const Mydict = require("../../models/mydict");

// 나만의 단어장 단어 뜻 조회 (단어별 좋아요 1위 단어 뜻, 내가 등록한 단어 뜻)
const findMydictMeanings = async (req, res) => {
  const nickname = res.locals.user.nickname;

  // 나만의 단어장에서 등록한 단어 조회 (나만의 단어장 word, scriptId, sentence용)
  const findMydictWords = await Mydict.aggregate([
    { $match: { nickname } },
    { $project: { _id: 0, nickname: 1, scriptId: 1, word: 1, sentence: 1 } },
  ]);

  // 나만의 단어장에 등록된 단어로 오픈사전 단어장에서 좋아요 1위 단어 찾기
  const findMostLikedMeanings = await Mydict.aggregate([
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
  const findMyMeanings = await Mydict.aggregate([
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
  for (let findMostLikedMeaning of findMostLikedMeanings) {
    let mostLikedMeaning = findMostLikedMeaning.meaning;
    mydictMeanings.push(mostLikedMeaning);
  }

  // 나만의 단어장에 내가 저장한 단어 넣기
  let idx = 0;
  for (let findMyMeaning of findMyMeanings) {
    let myMeaning = findMyMeaning.meaning;

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
};

module.exports = { findMydictMeanings };
