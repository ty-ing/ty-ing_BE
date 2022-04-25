const Opendict = require("../../models/opendict");

module.exports.updateLikeDislikeCount = async (scriptId, wordId) => {
  const findCount = await Opendict.findOne({ scriptId, wordId });

  await Opendict.updateOne(
    { scriptId, wordId },
    { $set: { count: findCount.likeCount - findCount.dislikeCount } }
  );

  return findCount;
};

module.exports.isLikeIsDislike = async (scriptId, wordId, nickname) => {
  const findCount = await updateLikeDislikeCount(scriptId, wordId);

  const isLike = findCount.likeList.includes(nickname);
  const isDislike = findCount.dislikeList.includes(nickname);
  return { isLike, isDislike };
};