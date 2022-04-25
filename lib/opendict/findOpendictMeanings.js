const Opendict = require("../../models/opendict");

module.exports.findOpendictMeanings = async (options) => {
  const scriptId = options.scriptId;
  const word = options.word;
  const nickname = options.nickname;

  if (!nickname) {
    let findMeanings = await Opendict.aggregate([
      { $match: { scriptId, word } },
      {
        $project: {
          _id: 0,
          meaning: 1,
          nickname: 1,
          likeCount: 1,
          dislikeCount: 1,
          count: 1,
          wordId: 1,
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          count: 0,
        },
      },
      {
        $addFields: {
          isLike: false,
          isDislike: false,
        },
      },
    ]);

    return findMeanings;
  } else if (scriptId && word && nickname) {
    let findMeanings = await Opendict.aggregate([
      { $match: { scriptId, word } },
      {
        $project: {
          _id: 0,
          meaning: 1,
          nickname: 1,
          likeCount: 1,
          dislikeCount: 1,
          count: 1,
          wordId: 1,
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          count: 0,
        },
      },
    ]);

    const findAllMeanings = await Opendict.aggregate([
      { $match: { scriptId, word } },
      { $sort: { count: -1 } },
    ]);

    const findIsLike = findAllMeanings.map((meaning, idx) => {
      return meaning.likeList.includes(nickname);
    });

    const findIsDislike = findAllMeanings.map((meaning, idx) => {
      return meaning.dislikeList.includes(nickname);
    });

    findMeanings.map((meaning, idx) => {
      meaning.isLike = findIsLike[idx];
      meaning.isDisLike = findIsDislike[idx];
      return meaning;
    });

    return findMeanings;
  }
};
