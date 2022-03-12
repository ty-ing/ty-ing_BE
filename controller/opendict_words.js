const Words = require("../models/opendict"); // 단어 스키마

// 단어 뜻 추가
const postWord = async (req, res) => {
  try {
    const { scriptId } = req.params;
    let { word, meaning } = req.body;
    const user = res.locals.user;
    const nickname = user.nickname;
    const findUser = await Words.findOne({ nickname, scriptId, word });
    word = word.toLowerCase();
    let likeList = [];
    let dislikeList = [];
    let likeCount = 0;
    let dislikeCount = 0;

    // 한 유저당 하나의 단어 뜻만 입력 가능 (여러개 입력 원하면 (ex) 맛있는, 맛이 좋은) 예시와 같이 ,로 단어 넣어야 함.)
    if (findUser) {
      return res.json({
        ok: false,
        errorMessage: "이미 단어 뜻을 등록하셨습니다.",
      });
    }

    // 이미 있는 단어 뜻일 경우 입력 불가
    const meaningFromFind = await Words.aggregate([
      { $match: { scriptId, word } },
      { $project: { meaning: 1 } },
    ]);

    console.log(meaningFromFind);

    let meaningList = [];
    for (let i of meaningFromFind) {
      meaningList.push(i.meaning);
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
    });
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

// 단어 뜻 조회
const getWord = async (req, res) => {
  try {
    const { scriptId } = req.params;
    let { word } = req.body;
    word = word.toLowerCase();

    const opendict = await Words.aggregate([
      { $match: { scriptId, word } },
      {
        $project: {
          _id: 0,
          nickname: 1,
          meaning: 1,
          likeCount: 1,
          dislikeCount: 1,
        },
      },
    ]);

    const sortedOpendict = opendict.sort(function (a, b) {
      if (a.likeCount - a.dislikeCount < b.likeCount - b.dislikeCount) {
        return 1;
      }
      if (a.likeCount - a.dislikeCount > b.likeCount - b.dislikeCount) {
        return -1;
      }
      // a must be equal to b
      return 0;
    });

    // 조회
    res.json({
      ok: true,
      message: "단어 뜻 조회 성공",
      word: word,
      opendict: sortedOpendict,
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
    const { scriptId, wordId } = req.params;
    let { word, meaning } = req.body;
    word = word.toLowerCase();

    const find = await Words.find({ scriptId, word }); // 단어가 일치하는 필드 여러개 찾기
    const findOne = await Words.findOne({ scriptId, wordId }); // 현재 단어 필드 하나 찾기
    const findNickname = findOne.nickname; // 디비에 있는 단어와 함께 저장된 닉네임

    // 로그인한 사용자와 단어 뜻을 등록한 사용자가 다를 때 수정 불가 (본인이 등록한 단어 뜻만 수정 가능)
    if (nickname !== findNickname) {
      return res.json({
        ok: false,
        errorMessage: "다른 사용자의 단어 뜻은 수정할 수 없습니다.",
      });
    }

    // 이미 있는 단어 뜻일 경우 수정 불가
    let meaningList = [];
    for (let i of find) {
      meaningList.push(i.meaning);
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

    const find = await Words.findOne({ scriptId, wordId });
    const findNickname = find.nickname;

    // 본인이 등록한 단어 뜻만 삭제 가능
    if (nickname !== findNickname) {
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

    const find = await Words.findOne({ scriptId, wordId });
    let likeList = find.likeList;
    let dislikeList = find.dislikeList;

    // 본인의 단어에는 좋아요를 누를 수 없음
    if (nickname === find.nickname) {
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

    // 클라이언트 쪽에 좋아요 수 보내기
    const sendlikeCount = await Words.findOne({ scriptId, wordId });
    console.log(sendlikeCount);
    res.json({
      ok: true,
      message: "좋아요 누르기 성공",
      likeCount: sendlikeCount.likeCount,
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
    console.log(nickname);

    const find = await Words.findOne({ scriptId, wordId });
    const likeList = find.likeList;

    // 본인의 단어에는 좋아요를 누르거나 취소할 수 없음
    if (nickname === find.nickname) {
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

    // 클라이언트 쪽에 좋아요 수 보내기
    const sendlikeCount = await Words.findOne({ scriptId, wordId });

    res.json({
      ok: true,
      message: "좋아요 취소 성공",
      likeCount: sendlikeCount.likeCount,
    });
  } catch (error) {
    res.json({ ok: false, errorMessage: "좋아요 취소 실패" });
    console.error(`${error} 에러로 좋아요 실패`);
  }
};

// 좋아요 조회
const getLike = async (req, res) => {
  try {
    const { scriptId, wordId } = req.params;

    const find = await Words.findOne({ scriptId, wordId });
    const likeCount = find.likeCount;

    res.json({ ok: true, message: "좋아요 조회 성공", likeCount: likeCount });
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

    const find = await Words.findOne({ scriptId, wordId });
    const likeList = find.likeList;
    const dislikeList = find.dislikeList;

    // 본인의 단어에는 싫어요를 누를 수 없음
    if (find.nickname === nickname) {
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

    const sendDislikeCount = await Words.findOne({ scriptId, wordId });

    res.json({
      ok: true,
      message: "싫어요 누르기 성공",
      dislikeCount: sendDislikeCount.dislikeCount,
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

    const find = await Words.findOne({ scriptId, wordId });
    const dislikeList = find.dislikeList;
    console.log(dislikeList);
    console.log(nickname);

    if (nickname === find.nickname) {
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

    const sendDislikeCount = await Words.findOne({ scriptId, wordId });
    res.json({
      ok: true,
      message: "싫어요 취소 성공",
      dislikeList: sendDislikeCount.dislikeCount,
    });
  } catch (error) {
    res.json({ ok: false, errorMessage: "싫어요 취소 실패" });
    console.error(`${error} 에러로 싫어요 취소 실패`);
  }
};

// 싫어요 조회
const getDislike = async (req, res) => {
  try {
    const { scriptId, wordId } = req.params;

    const find = await Words.findOne({ scriptId, wordId });
    const dislikeCount = find.dislikeCount;

    res.json({
      ok: true,
      message: "싫어요 조회 성공",
      dislikeCount: dislikeCount,
    });
  } catch (error) {
    res.json({ ok: false, errorMessage: "싫어요 조회 실패" });
    console.error(`${error} 에러로 싫어요 조회 실패`);
  }
};

module.exports = {
  //오픈사전 단어장
  postWord, // 단어 뜻 추가, 수정
  getWord, // 단어 뜻 조회
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
