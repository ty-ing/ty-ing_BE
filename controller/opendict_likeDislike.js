const Opendict = require("../models/opendict");
const { updateLikeDislikeCount, isLikeIsDislike } = require("../lib/opendict/aboutLikeDislike"); 

module.exports.likeUp = likeUp();
module.exports.likeDown = likeDown();
module.exports.getLike = getLike();
module.exports.dislikeUp = dislikeUp();
module.exports.dislikeDown = dislikeDown();
module.exports.getDislike = getDislike();

function likeUp() {
  return async (req, res) => {
    try {
      const nickname = res.locals.user.nickname;
      const { scriptId, wordId } = req.params;

      const findMeaning = await Opendict.findOne({ scriptId, wordId });
      let likeList = findMeaning.likeList;
      let dislikeList = findMeaning.dislikeList;

      if (nickname === findMeaning.nickname) {
        return res.json({
          ok: false,
          errorMessage: "본인이 등록한 단어 뜻에는 좋아요를 누를 수 없습니다.",
        });
      }

      if (likeList.includes(nickname)) {
        return res.json({
          ok: false,
          errorMessage: "이미 좋아요를 누르셨습니다.",
        });
      }

      if (dislikeList.includes(nickname)) {
        await Opendict.updateOne(
          { scriptId, wordId },
          {
            $pull: { dislikeList: nickname },
            $push: { likeList: nickname },
            $inc: { likeCount: +1, dislikeCount: -1 },
          }
        );
      } else {
        await Opendict.updateOne(
          { scriptId, wordId },
          {
            $push: { likeList: nickname },
            $inc: { likeCount: +1 },
          }
        );
      }

      const findCount = await updateLikeDislikeCount(scriptId, wordId);
      const { isLike, isDislike } = await isLikeIsDislike(
        scriptId,
        wordId,
        nickname
      );

      res.json({
        ok: true,
        message: "좋아요 누르기 성공",
        likeCount: findCount.likeCount,
        isLike,
        isDislike,
      });
    } catch (error) {
      res.status(400).json({ ok: false, errorMessage: "좋아요 누르기 실패" });
      console.error(`${error} 에러로 인해 좋아요 누르기 실패`);
    }
  };
}

function likeDown() {
  return async (req, res) => {
    try {
      const nickname = res.locals.user.nickname;
      const { scriptId, wordId } = req.params;

      const findMeaning = await Opendict.findOne({ scriptId, wordId });
      const likeList = findMeaning.likeList;

      if (nickname === findMeaning.nickname) {
        return res.json({
          ok: false,
          errorMessage:
            "본인이 등록한 단어 뜻에는 좋아요를 누르거나 취소할 수 없습니다.",
        });
      }

      if (!likeList.includes(nickname)) {
        return res.json({
          ok: false,
          errorMessage:
            "좋아요를 누르지 않으셨거나 이미 좋아요를 취소하셨습니다.",
        });
      }

      await Opendict.updateOne(
        { scriptId, wordId },
        { $pull: { likeList: nickname }, $inc: { likeCount: -1 } }
      );

      const findCount = await updateLikeDislikeCount(scriptId, wordId);
      const { isLike, isDislike } = await isLikeIsDislike(
        scriptId,
        wordId,
        nickname
      );

      res.json({
        ok: true,
        message: "좋아요 취소 성공",
        likeCount: findCount.likeCount,
        isLike,
        isDislike,
      });
    } catch (error) {
      res.status(400).json({ ok: false, errorMessage: "좋아요 취소 실패" });
      console.error(`${error} 에러로 좋아요 실패`);
    }
  };
}

function getLike() {
  return async (req, res) => {
    try {
      const nickname = res.locals.user.nickname;
      const { scriptId, wordId } = req.params;

      const findMeaning = await Opendict.findOne({ scriptId, wordId });
      const isLike = findMeaning.likeList.includes(nickname);
      const isDislike = findMeaning.dislikeList.includes(nickname);

      res.json({
        ok: true,
        message: "좋아요 조회 성공",
        likeCount: findMeaning.likeCount,
        isLike,
        isDislike,
      });
    } catch (error) {
      res.status(400).json({ ok: false, errorMessage: "좋아요 조회 실패" });
      console.error(`${error} 에러로 좋아요 조회 실패`);
    }
  };
}

function dislikeUp() {
  return async (req, res) => {
    try {
      const nickname = res.locals.user.nickname;
      const { scriptId, wordId } = req.params;

      const findMeaning = await Opendict.findOne({ scriptId, wordId });
      const likeList = findMeaning.likeList;
      const dislikeList = findMeaning.dislikeList;

      if (nickname === findMeaning.nickname) {
        return res.json({
          ok: false,
          errorMessage: "본인이 등록한 단어 뜻에는 싫어요를 누를 수 없습니다.",
        });
      }

      if (dislikeList.includes(nickname)) {
        return res.json({
          ok: false,
          errorMessage: "이미 싫어요를 누르셨습니다",
        });
      }

      if (likeList.includes(nickname)) {
        await Opendict.updateOne(
          { scriptId, wordId },
          {
            $pull: { likeList: nickname },
            $push: { dislikeList: nickname },
            $inc: { likeCount: -1, dislikeCount: +1 },
          }
        );
      } else {
        await Opendict.updateOne(
          { scriptId, wordId },
          {
            $push: { dislikeList: nickname },
            $inc: { dislikeCount: +1 },
          }
        );
      }

      const findCount = await updateLikeDislikeCount(scriptId, wordId);
      const { isLike, isDislike } = await isLikeIsDislike(
        scriptId,
        wordId,
        nickname
      );

      res.json({
        ok: true,
        message: "싫어요 누르기 성공",
        dislikeCount: findCount.dislikeCount,
        isLike,
        isDislike,
      });
    } catch (error) {
      res.status(400).json({ ok: false, errorMessage: "싫어요 누르기 실패" });
      console.error(`${error} 에러로 싫어요 누르기 실패`);
    }
  };
}

function dislikeDown() {
  return async (req, res) => {
    try {
      const nickname = res.locals.user.nickname;
      const { scriptId, wordId } = req.params;
      console.log(scriptId);
      console.log(wordId);

      const findMeaning = await Opendict.findOne({ scriptId, wordId });
      const dislikeList = findMeaning.dislikeList;

      if (nickname === findMeaning.nickname) {
        return res.json({
          ok: false,
          errorMessage:
            "본인이 등록한 단어 뜻에는 싫어요를 누르거나 취소할 수 없습니다.",
        });
      }

      if (!dislikeList.includes(nickname)) {
        return res.json({
          ok: false,
          errorMessage:
            "싫어요를 누르지 않으셨거나 이미 싫어요를 취소하셨습니다.",
        });
      }

      await Opendict.updateOne(
        { scriptId, wordId },
        { $pull: { dislikeList: nickname }, $inc: { dislikeCount: -1 } }
      );

      const findCount = await updateLikeDislikeCount(scriptId, wordId);
      const { isLike, isDislike } = await isLikeIsDislike(
        scriptId,
        wordId,
        nickname
      );

      res.json({
        ok: true,
        message: "싫어요 취소 성공",
        dislikeList: findCount.dislikeCount,
        isLike,
        isDislike,
      });
    } catch (error) {
      res.status(400).json({ ok: false, errorMessage: "싫어요 취소 실패" });
      console.error(`${error} 에러로 싫어요 취소 실패`);
    }
  };
}

function getDislike() {
  return async (req, res) => {
    try {
      const nickname = res.locals.user.nickname;
      const { scriptId, wordId } = req.params;

      const findMeaning = await Opendict.findOne({ scriptId, wordId });
      const isLike = findMeaning.likeList.includes(nickname);
      const isDislike = findMeaning.dislikeList.includes(nickname);

      res.json({
        ok: true,
        message: "싫어요 조회 성공",
        dislikeCount: findMeaning.dislikeCount,
        isLike,
        isDislike,
      });
    } catch (error) {
      res.status(400).json({ ok: false, errorMessage: "싫어요 조회 실패" });
      console.error(`${error} 에러로 싫어요 조회 실패`);
    }
  };
}
