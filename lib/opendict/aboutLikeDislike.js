const Opendict = require("../../models/opendict");

// 좋아요 싫어요 관련 함수모음

// count용 함수
// 좋아요 순서정렬을 위한 (좋아요 - 싫어요)count 업데이트 하기 + 좋아요 또는 싫어요 개별 count 조회용
const updateLikeDislikeCount = async (scriptId, wordId) => {
  const findCount = await Opendict.findOne({ scriptId, wordId }); // 좋아요 or 싫어요 후 업데이트 된 카운트 필드 찾기
  
  // (좋아요 - 싫어요)count 업데이트
  await Opendict.updateOne(
    { scriptId, wordId },
    { $set: { count: findCount.likeCount - findCount.dislikeCount } }
  );

  // 좋아요, 싫어요 개별 count 조회용
  return findCount;
};

// 사용자가 각 단어 뜻에 좋아요, 싫어요를 했는지 확인용
const isLikeIsDislike = async (scriptId, wordId, nickname) => {
  const findCount = await updateLikeDislikeCount(scriptId, wordId);

  const isLike = findCount.likeList.includes(nickname);
  const isDislike = findCount.dislikeList.includes(nickname);
  return { isLike, isDislike };
};

module.exports = { updateLikeDislikeCount, isLikeIsDislike };
