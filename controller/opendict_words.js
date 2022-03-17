const Words = require("../models/opendict"); // 단어 스키마

// 단어 뜻 추가
const postWord = async (req, res) => {
  try {
    const nickname = res.locals.user.nickname;
    let { scriptId, word } = req.params;
    let { meaning } = req.body;
    word = word.toLowerCase();

    let likeList = [];
    let dislikeList = [];
    let likeCount = 0;
    let dislikeCount = 0;
    let count = 0;

    // 단어 뜻을 입력하지 않았을 경우 뜻 추가 불가
    if (!word || !meaning) {
      return res.json({
        ok: false,
        errorMessage: "단어 뜻을 입력하지 않았습니다.",
      });
    }

    // 유저가 등록한 단어 이미 있는지 찾기
    const findUserMeaning = await Words.findOne({ nickname, scriptId, word });

    // 한 유저당 하나의 단어 뜻만 입력 가능 (여러개 입력 원하면 (ex) 맛있는, 맛이 좋은) 예시와 같이 ,로 단어 넣어야 함.)
    if (findUserMeaning) {
      return res.json({
        ok: false,
        errorMessage: "이미 단어 뜻을 등록하셨습니다.",
      });
    }

    // 이미 있는 단어 뜻일 경우 입력 불가
    // 단어 뜻 전체 검색
    const findMeanings = await Words.aggregate([
      { $match: { scriptId, word } },
      { $project: { _id: 0, meaning: 1 } },
    ]);

    let meaningList = []; // JSON 해체 후 meaning만 뽑아내서 리스트 만들기
    for (let findMeaning of findMeanings) {
      meaningList.push(findMeaning.meaning);
    }

    if (meaningList.includes(meaning)) {
      return res.json({ ok: false, errorMessage: "이미 있는 단어뜻 입니다." });
    }

    // 단어 뜻 20자리 이하만 입력 가능
    const regex = /^.{1,20}$/; // 영,한 상관없이 20자리
    // const regex = /^[ㄱ-ㅎㅏ-ㅣ가-힣\s]{1,20}$/; // 공백 가능, 한글만 10자리까지

    if (!regex.test(meaning)) {
      return res.json({
        ok: false,
        errorMessage: "단어 뜻을 20자 이내로 입력하세요",
      });
    }

    // 추가
    await Words.create({
      nickname,
      scriptId,
      word,
      meaning,
      likeList,
      dislikeList,
      likeCount,
      dislikeCount,
      count,
    });

    // 추가된 단어 뜻 wordId 같이 보내주기
    const findAddedWord = await Words.findOne({ nickname, scriptId, word });

    res.json({
      ok: true,
      message: "단어 뜻 추가 성공",
      wordId: findAddedWord.wordId,
    });
  } catch (error) {
    res.json({ ok: false, errorMessage: "단어 뜻 추가 실패" });
    console.error(`${error} 에러로 단어 뜻 추가 실패`);
  }
};

// 단어 뜻 조회 게스트용
const getWordForGuest = async (req, res) => {
  try {
    let { scriptId, word } = req.params;
    word = word.toLowerCase();

    // 등록한 단어만 조회 가능
    const findMeaning = await Words.findOne({ scriptId, word });
    if (!findMeaning) {
      return res.json({ ok: false, errorMessage: "등록된 단어가 아닙니다." });
    }

    const findMeanings = await Words.aggregate([
      { $match: { scriptId, word } },
      {
        $project: {
          _id: 0,
          word: 1,
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
          meaning: 1,
          nickname: 1,
          likeCount: 1,
          dislikeCount: 1,
          wordId: 1,
        },
      },
      {
        $addFields: {
          isLike: false,
          isDislike: false,
        },
      },
    ]);

    // 조회
    res.json({
      ok: true,
      message: "단어 뜻 조회 성공",
      word,
      opendict: findMeanings,
    });
  } catch (error) {
    res.json({ ok: false, errorMessage: "단어 뜻 조회 실패" });
    console.error(`${error} 에러로 인해 단어 뜻 조회 실패`);
  }
};

// 단어 뜻 조회 로그인한 사용자용
const getWordForUser = async (req, res) => {
  try {
    const nickname = res.locals.user.nickname;
    let { scriptId, word } = req.params;
    word = word.toLowerCase();

    // 등록한 단어만 조회 가능
    const findMeaning = await Words.findOne({ scriptId, word });
    if (!findMeaning) {
      return res.json({ ok: false, errorMessage: "등록된 단어가 아닙니다." });
    }

    // 전체 단어 but 조건 일치 하는 부분만 조회
    let findMeanings = await Words.aggregate([
      { $match: { scriptId, word } },
      {
        $project: {
          _id: 0,
          word: 1,
          meaning: 1,
          nickname: 1,
          likeList: 1,
          dislikeList: 1,
          likeCount: 1,
          dislikeCount: 1,
          count: 1,
          wordId: 1,
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          meaning: 1,
          nickname: 1,
          likeCount: 1,
          dislikeCount: 1,
          wordId: 1,
        },
      },
    ]);

    // 전체 단어 모든 조건 조회
    const findAllMeanings = await Words.aggregate([
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
      meaning.disLike = findIsDislike[idx];
      return meaning;
    });

    // 조회
    res.json({
      ok: true,
      message: "단어 뜻 조회 성공",
      word,
      opendict: findMeanings,
    });
  } catch (error) {
    res.json({ ok: false, errorMessage: "단어 뜻 조회 실패" });
    console.error(`${error} 에러로 인해 단어 뜻 조회 실패`);
  }
};

// 단어 뜻 수정
const putWord = async (req, res) => {
  try {
    const user = res.locals.user;
    const nickname = user.nickname; // 로그인한 사용자의 닉네임
    let { scriptId, word, wordId } = req.params;
    let { meaning } = req.body;
    word = word.toLowerCase();

    const findMeanings = await Words.find({ scriptId, word }); // 단어가 일치하는 필드 여러개 찾기
    const findMeaning = await Words.findOne({ scriptId, wordId }); // 입력 받은 단어 뜻 필드 하나 찾기

    // 로그인한 사용자와 단어 뜻을 등록한 사용자가 다를 때 수정 불가 (본인이 등록한 단어 뜻만 수정 가능)
    if (nickname !== findMeaning.nickname) {
      return res.json({
        ok: false,
        errorMessage: "다른 사용자의 단어 뜻은 수정할 수 없습니다.",
      });
    }

    // 전체 단어 검색해서 현재 수정하려고 하는 뜻과 비교 후 이미 있는 단어 뜻일 경우 수정 불가
    let meaningList = []; // JSON 해체 후 meaning만 뽑아내서 리스트 만들기
    for (let findMeaning of findMeanings) {
      meaningList.push(findMeaning.meaning);
    }

    if (meaningList.includes(meaning)) {
      return res.json({ ok: false, errorMessage: "이미 있는 단어 뜻입니다." });
    }

    // 수정
    await Words.updateOne({ scriptId, wordId }, { $set: { meaning: meaning } });

    res.json({ ok: true, message: "단어 뜻 수정 성공" });
  } catch (error) {
    res.json({ ok: false, errorMessage: "단어 뜻 수정 실패" });
    console.error(`${error} 에러로 단어 뜻 수정 실패`);
  }
};

// 단어 뜻 삭제
const deleteWord = async (req, res) => {
  try {
    const nickname = res.locals.user.nickname;
    const { scriptId, wordId } = req.params;

    const findMeaning = await Words.findOne({ scriptId, wordId }); // 입력 받은 단어 뜻 필드 찾기

    // 본인이 등록한 단어 뜻만 삭제 가능
    if (nickname !== findMeaning.nickname) {
      return res.json({
        ok: false,
        errorMessage: "다른 사용자의 단어 뜻은 삭제할 수 없습니다.",
      });
    }

    await Words.deleteOne({ scriptId, wordId });
    res.json({ ok: true, message: "단어 뜻 삭제 성공" });
  } catch (error) {
    res.json({ ok: false, errorMessage: "단어 뜻 삭제 실패" });
    console.error(`${error} 에러로 단어 뜻 삭제 실패`);
  }
};

// 좋아요 누르기
const likeUp = async (req, res) => {
  try {
    const nickname = res.locals.user.nickname;
    const { scriptId, wordId } = req.params;

    const findMeaning = await Words.findOne({ scriptId, wordId }); // 입력 받은 단어 뜻 필드 찾기
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
      await Words.updateOne(
        { scriptId, wordId },
        {
          $pull: { dislikeList: nickname },
          $push: { likeList: nickname },
          $inc: { likeCount: +1, dislikeCount: -1 },
        }
      );
    } else {
      await Words.updateOne(
        { scriptId, wordId },
        {
          $push: { likeList: nickname },
          $inc: { likeCount: +1 },
        }
      );
    }

    // 좋아요 - 싫어요 count 업데이트
    const findCount = await Words.findOne({ scriptId, wordId }); // 업데이트 된 카운트 찾기
    await Words.updateOne(
      { scriptId, wordId },
      { $set: { count: findCount.likeCount - findCount.dislikeCount } }
    );

    const isLike = findCount.likeList.includes(nickname);
    const isDislike = findCount.dislikeList.includes(nickname);

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

    const findMeaning = await Words.findOne({ scriptId, wordId }); // 입력 받은 단어 뜻 필드 찾기
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

    await Words.updateOne(
      { scriptId, wordId },
      { $pull: { likeList: nickname }, $inc: { likeCount: -1 } }
    );

    // 좋아요 - 싫어요 count 업데이트
    const findCount = await Words.findOne({ scriptId, wordId });

    const isLike = findCount.likeList.includes(nickname);
    const isDislike = findCount.dislikeList.includes(nickname);

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

    const findMeaning = await Words.findOne({ scriptId, wordId }); // 입력 받은 단어 뜻 필드 찾기
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

    const findMeaning = await Words.findOne({ scriptId, wordId }); // 입력 받은 단어 뜻 필드 찾기
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
      await Words.updateOne(
        { scriptId, wordId },
        {
          $pull: { likeList: nickname },
          $push: { dislikeList: nickname },
          $inc: { likeCount: -1, dislikeCount: +1 },
        }
      );
    } else {
      await Words.updateOne(
        { scriptId, wordId },
        {
          $push: { dislikeList: nickname },
          $inc: { dislikeCount: +1 },
        }
      );
    }

    // 좋아요 - 싫어요 count 업데이트
    const findCount = await Words.findOne({ scriptId, wordId }); // 업데이트 된 카운트 찾기
    await Words.updateOne(
      { scriptId, wordId },
      {
        $set: {
          count: findCount.likeCount - findCount.dislikeCount,
        },
      }
    );

    const isLike = findCount.likeList.includes(nickname);
    const isDislike = findCount.dislikeList.includes(nickname);

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

    const findMeaning = await Words.findOne({ scriptId, wordId }); // 입력 받은 단어 뜻 필드 찾기
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

    await Words.updateOne(
      { scriptId, wordId },
      { $pull: { dislikeList: nickname }, $inc: { dislikeCount: -1 } }
    );

    const findCount = await Words.findOne({ scriptId, wordId });

    const isLike = findCount.likeList.includes(nickname);
    const isDislike = findCount.dislikeList.includes(nickname);

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

    const findMeaning = await Words.findOne({ scriptId, wordId }); // 입력 받은 단어 뜻 필드 찾기
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

module.exports = {
  //오픈사전 단어장
  postWord, // 단어 뜻 추가, 수정
  getWordForGuest, // 단어 뜻 조회 게스트용
  getWordForUser, // 단어 뜻 조회 로그인한 사용자용
  putWord, // 단어 뜻 수정
  deleteWord, // 단어 뜻 삭제

  // 좋아요
  likeUp, // 좋아요 누르기
  likeDown, // 좋아요 취소
  getLike, // 좋아요 조회

  // 싫어요
  dislikeUp, // 싫어요 누르기
  dislikeDown, // 싫어요 취소
  getDislike, // 싫어요 조회
};
