const Mydict = require("../../models/mydict");

module.exports.findMydictMeanings = async (req, res) => {
  const nickname = res.locals.user.nickname;

  const findMydictWords = await Mydict.aggregate([
    { $match: { nickname } },
    { $project: { _id: 0, nickname: 1, scriptId: 1, word: 1, sentence: 1 } },
  ]);

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

  let mydictMeanings = [];

  for (let findMostLikedMeaning of findMostLikedMeanings) {
    let mostLikedMeaning = findMostLikedMeaning.meaning;
    mydictMeanings.push(mostLikedMeaning);
  }

  let idx = 0;
  for (let findMyMeaning of findMyMeanings) {
    let myMeaning = findMyMeaning.meaning;

    if (myMeaning.length === 0) {
      myMeaning = [{ meaning: "" }];
    }

    mydictMeanings[idx].push(
      ...myMeaning,
      findMydictWords[idx].word,
      findMydictWords[idx].sentence,
      findMydictWords[idx].scriptId
    );

    if (mydictMeanings[idx][0] || mydictMeanings[idx][1]) {
      mydictMeanings[idx][0] = mydictMeanings[idx][0].meaning;
      mydictMeanings[idx][1] = mydictMeanings[idx][1].meaning;
    }

    idx++;
  }
  return mydictMeanings;
};
