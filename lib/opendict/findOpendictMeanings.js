const Opendict = require("../../models/opendict");

// 오픈사전 단어장 단어 뜻 조회
const findOpendictMeanings = async (options) => {
  const scriptId = options.scriptId;
  const word = options.word;
  const nickname = options.nickname;

  // 오픈사전 단어장 단어 뜻 조회 (게스트 용) -> isLike, isDislike가 기본 false
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
  }
  //오픈사전 단어장 단어 뜻 조회 (로그인 유저용)
  else if (scriptId && word && nickname) {
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

    // 전체 단어 모든 조건 조회
    const findAllMeanings = await Opendict.aggregate([
      { $match: { scriptId, word } },
      { $sort: { count: -1 } },
    ]);

    // 유저가 like를 했는지 찾아서 모으기
    const findIsLike = findAllMeanings.map((meaning, idx) => {
      return meaning.likeList.includes(nickname);
    });

    // 유저가 dislike를 했는지 찾아서 모으기
    const findIsDislike = findAllMeanings.map((meaning, idx) => {
      return meaning.dislikeList.includes(nickname);
    });

    // isLike, disLike 추가
    findMeanings.map((meaning, idx) => {
      meaning.isLike = findIsLike[idx];
      meaning.isDisLike = findIsDislike[idx];
      return meaning;
    });

    return findMeanings;
  }
};

module.exports = { findOpendictMeanings };
