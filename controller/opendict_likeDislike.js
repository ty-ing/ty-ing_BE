const Opendict = require("../models/opendict"); // 오픈사전 스키마

// 좋아요 누르기
const likeUp = async (req, res) => {
  try {
    const nickname = res.locals.user.nickname;
    const { scriptId, wordId } = req.params;

    const findMeaning = await Opendict.findOne({ scriptId, wordId }); // 입력 받은 단어 뜻 필드 찾기
    let likeList = findMeaning.likeList;
    let dislikeList = findMeaning.dislikeList;

    // 본인의 단어에는 좋아요를 누를 수 없음
    if (nickname === findMeaning.nickname) {
      return res.json({
        ok: false,
        errorMessage: "본인이 등록한 단어 뜻에는 좋아요를 누를 수 없습니다.",
      });
    }

    // 좋아요 여러번 불가
    if (likeList.includes(nickname)) {
      return res.json({
        ok: false,
        errorMessage: "이미 좋아요를 누르셨습니다.",
      });
    }

    // 좋아요
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

    // 좋아요 - 싫어요 count 업데이트, 좋아요, 싫어요 여부
    const { findCount, isLike, isDislike } = await aboutLikeDislike(
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
    res.json({ ok: false, errorMessage: "좋아요 누르기 실패" });
    console.error(`${error} 에러로 인해 좋아요 누르기 실패`);
  }
};

// 좋아요 취소
const likeDown = async (req, res) => {
  try {
    const nickname = res.locals.user.nickname; // 로그인한 닉네임
    const { scriptId, wordId } = req.params;

    const findMeaning = await Opendict.findOne({ scriptId, wordId }); // 입력 받은 단어 뜻 필드 찾기
    const likeList = findMeaning.likeList;

    // 본인의 단어에는 좋아요를 누르거나 취소할 수 없음
    if (nickname === findMeaning.nickname) {
      return res.json({
        ok: false,
        errorMessage:
          "본인이 등록한 단어 뜻에는 좋아요를 누르거나 취소할 수 없습니다.",
      });
    }

    // 좋아요 안 눌렀거나 이미 취소 했을 때
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

    // 좋아요 - 싫어요 count 업데이트, 좋아요, 싫어요 여부
    const { findCount, isLike, isDislike } = await aboutLikeDislike(
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
    res.json({ ok: false, errorMessage: "좋아요 취소 실패" });
    console.error(`${error} 에러로 좋아요 실패`);
  }
};

// 좋아요 조회
const getLike = async (req, res) => {
  try {
    const nickname = res.locals.user.nickname;
    const { scriptId, wordId } = req.params;

    const findMeaning = await Opendict.findOne({ scriptId, wordId }); // 입력 받은 단어 뜻 필드 찾기
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
    res.json({ ok: false, errorMessage: "좋아요 조회 실패" });
    console.error(`${error} 에러로 좋아요 조회 실패`);
  }
};

// 싫어요 누르기
const dislikeUp = async (req, res) => {
  try {
    const nickname = res.locals.user.nickname;
    const { scriptId, wordId } = req.params;

    const findMeaning = await Opendict.findOne({ scriptId, wordId }); // 입력 받은 단어 뜻 필드 찾기
    const likeList = findMeaning.likeList;
    const dislikeList = findMeaning.dislikeList;

    // 본인의 단어에는 싫어요를 누를 수 없음
    if (nickname === findMeaning.nickname) {
      return res.json({
        ok: false,
        errorMessage: "본인이 등록한 단어 뜻에는 싫어요를 누를 수 없습니다.",
      });
    }

    // 싫어요 여러번 불가
    if (dislikeList.includes(nickname)) {
      return res.json({
        ok: false,
        errorMessage: "이미 싫어요를 누르셨습니다",
      });
    }

    // 싫어요
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

    // 좋아요 - 싫어요 count 업데이트, 좋아요, 싫어요 여부
    const { findCount, isLike, isDislike } = await aboutLikeDislike(
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
    res.json({ ok: false, errorMessage: "싫어요 누르기 실패" });
    console.error(`${error} 에러로 싫어요 누르기 실패`);
  }
};

// 싫어요 취소
const dislikeDown = async (req, res) => {
  try {
    const nickname = res.locals.user.nickname;
    const { scriptId, wordId } = req.params;
    console.log(scriptId);
    console.log(wordId);

    const findMeaning = await Opendict.findOne({ scriptId, wordId }); // 입력 받은 단어 뜻 필드 찾기
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

    // 좋아요 - 싫어요 count 업데이트, 좋아요, 싫어요 여부
    const { findCount, isLike, isDislike } = await aboutLikeDislike(
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
    res.json({ ok: false, errorMessage: "싫어요 취소 실패" });
    console.error(`${error} 에러로 싫어요 취소 실패`);
  }
};

// 싫어요 조회
const getDislike = async (req, res) => {
  try {
    const nickname = res.locals.user.nickname;
    const { scriptId, wordId } = req.params;

    const findMeaning = await Opendict.findOne({ scriptId, wordId }); // 입력 받은 단어 뜻 필드 찾기
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
    res.json({ ok: false, errorMessage: "싫어요 조회 실패" });
    console.error(`${error} 에러로 싫어요 조회 실패`);
  }
};

// function : 좋아요 - 싫어요 count 반영해주기, 좋아요, 싫어요 여부
async function aboutLikeDislike(scriptId, wordId, nickname) {
  const findCount = await Opendict.findOne({ scriptId, wordId }); // 좋아요 or 싫어요 후 업데이트 된 카운트 필드 찾기
  await Opendict.updateOne(
    { scriptId, wordId },
    { $set: { count: findCount.likeCount - findCount.dislikeCount } }
  );

  // 사용자가 좋아요 눌렀는지 안 눌렀는지
  const isLike = findCount.likeList.includes(nickname);
  const isDislike = findCount.dislikeList.includes(nickname);
  return { findCount, isLike, isDislike };
}

module.exports = {
  //오픈사전 단어장
  // 좋아요
  likeUp, // 좋아요 누르기
  likeDown, // 좋아요 취소
  getLike, // 좋아요 조회

  // 싫어요
  dislikeUp, // 싫어요 누르기
  dislikeDown, // 싫어요 취소
  getDislike, // 싫어요 조회
};
