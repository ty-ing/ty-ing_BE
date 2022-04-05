const Opendict = require("../models/opendict"); // 오픈사전 단어장 스키마
const Mydict = require("../models/mydict"); // 나만의 단어장 스키마
const { fWordsFilter } = require("../lib/opendict/fwordsFillter"); // 욕설 필터링
const { findOpendictMeanings } = require("../lib/opendict/findOpendictMeanings"); // 단어 뜻 조회

// 오픈사전 단어장
// 단어 뜻 추가
module.exports.postWord = postWord();

// 단어 뜻 조회 게스트용
module.exports.getWordForGuest = getWordForGuest();

// 단어 뜻 조회 로그인한 사용자용
module.exports.getWordForUser = getWordForUser();

// 단어 뜻 수정
module.exports.putWord = putWord();

// 단어 뜻 삭제
module.exports.deleteWord = deleteWord();

function postWord() {
  return async (req, res) => {
    try {
      const nickname = res.locals.user.nickname;
      const id = res.locals.user.id;
      let { scriptId, word } = req.params;
      let { meaning } = req.body;
      word = word.toLowerCase();

      let likeList = [];
      let dislikeList = [];
      let likeCount = 0;
      let dislikeCount = 0;
      let count = 0;

      // 단어 뜻 첫자리 공백 검사
      const regexSpace = /^\s(\S*|\s)/;
      if (regexSpace.test(meaning)) {
        return res.json({
          ok: false,
          errorMessage: "첫 자리 공백은 허용되지 않습니다.",
        });
      }

      // 단어 뜻을 입력하지 않았을 경우 뜻 추가 불가
      if (!word || !meaning) {
        return res.json({
          ok: false,
          errorMessage: "단어 뜻을 입력하지 않았습니다.",
        });
      }

      // 욕설 필터링
      const isFword = await fWordsFilter(meaning);

      if (isFword) {
        return res.json({
          ok: false,
          errorMessage:
            "욕설 혹은 올바르지 않은 뜻을 등록하는 경우 건전한 서비스 환경 제공에 어려움이 있으므로 서비스 이용이 제한될 수 있습니다.",
        });
      }

      // 유저가 등록한 단어 이미 있는지 찾기
      const findUserMeaning = await Opendict.findOne({
        nickname,
        scriptId,
        word,
      });

      // 한 유저당 하나의 단어 뜻만 입력 가능 (여러개 입력 원하면 (ex) 맛있는, 맛이 좋은) 예시와 같이 ,로 단어 넣어야 함.)
      if (findUserMeaning) {
        return res.json({
          ok: false,
          errorMessage: "이미 단어 뜻을 등록하셨습니다.",
        });
      }

      // 이미 있는 단어 뜻일 경우 입력 불가
      // 단어 뜻 전체 검색
      const findMeanings = await Opendict.aggregate([
        { $match: { scriptId, word } },
        { $project: { _id: 0, meaning: 1 } },
      ]);

      let meaningList = []; // JSON 해체 후 meaning만 뽑아내서 리스트 만들기
      for (let findMeaning of findMeanings) {
        meaningList.push(findMeaning.meaning);
      }

      if (meaningList.includes(meaning)) {
        return res.json({
          ok: false,
          errorMessage: "이미 있는 단어 뜻 입니다.",
        });
      }

      // 단어 뜻 20자리 이하만 입력 가능
      const regexRange = /^.{1,20}$/; // 영,한 상관없이 20자리

      // const regexRange = /^[ㄱ-ㅎㅏ-ㅣ가-힣\s]{1,20}$/; // 공백 가능, 한글만 10자리까지
      if (!regexRange.test(meaning)) {
        return res.json({
          ok: false,
          errorMessage: "단어 뜻을 20자 이내로 입력하세요",
        });
      }

      // 추가
      await Opendict.create({
        id,
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
      const findAddedWord = await Opendict.findOne({
        nickname,
        scriptId,
        word,
      });

      // 사용자가 나만의 단어장에 이 단어를 저장했는지?
      const findMydictWord = await Mydict.find({ nickname, scriptId, word });
      const isSavedMydict = findMydictWord.length === 0 ? false : true;

      res.status(201).json({
        ok: true,
        message: "단어 뜻 추가 성공",
        wordId: findAddedWord.wordId,
        isSavedMydict,
      });
    } catch (error) {
      res.status(400).json({ ok: false, errorMessage: "단어 뜻 추가 실패" });
      console.error(`${error} 에러로 단어 뜻 추가 실패`);
    }
  };
}

function getWordForGuest() {
  return async (req, res) => {
    try {
      let { scriptId, word } = req.params;
      word = word.toLowerCase();

      // 등록한 단어만 조회 가능
      const findMeaning = await Opendict.findOne({ scriptId, word });
      if (!findMeaning) {
        return res.json({ ok: false, errorMessage: "등록된 단어가 아닙니다." });
      }

      // 오픈사전 단어장 단어 뜻 조회 (게스트 용)
      const findMeanings = await findOpendictMeanings(
        (options = { scriptId, word })
      );

      // 조회
      res.json({
        ok: true,
        message: "단어 뜻 조회 성공",
        word,
        opendict: findMeanings,
      });
    } catch (error) {
      res.status(400).json({ ok: false, errorMessage: "단어 뜻 조회 실패" });
      console.error(`${error} 에러로 인해 단어 뜻 조회 실패`);
    }
  };
}

function getWordForUser() {
  return async (req, res) => {
    try {
      const nickname = res.locals.user.nickname;
      let { scriptId, word } = req.params;
      word = word.toLowerCase();

      // 등록한 단어만 조회 가능
      const findMeaning = await Opendict.findOne({ scriptId, word });
      if (!findMeaning) {
        return res.json({ ok: false, errorMessage: "등록된 단어가 아닙니다." });
      }

      // 오픈사전 단어장 단어 뜻 조회 (로그인 유저용)
      let findMeanings = await findOpendictMeanings(
        (options = { scriptId, word, nickname })
      );

      // 조회
      res.json({
        ok: true,
        message: "단어 뜻 조회 성공",
        word,
        opendict: findMeanings,
      });
    } catch (error) {
      res.status(400).json({ ok: false, errorMessage: "단어 뜻 조회 실패" });
      console.error(`${error} 에러로 인해 단어 뜻 조회 실패`);
    }
  };
}

function putWord() {
  return async (req, res) => {
    try {
      const user = res.locals.user;
      const nickname = user.nickname; // 로그인한 사용자의 닉네임
      let { scriptId, word, wordId } = req.params;
      let { meaning } = req.body;
      word = word.toLowerCase();

      const findMeanings = await Opendict.find({ scriptId, word }); // 단어가 일치하는 필드 여러개 찾기
      const findMeaning = await Opendict.findOne({ scriptId, wordId }); // 입력 받은 단어 뜻 필드 하나 찾기

      // 로그인한 사용자와 단어 뜻을 등록한 사용자가 다를 때 수정 불가 (본인이 등록한 단어 뜻만 수정 가능)
      if (nickname !== findMeaning.nickname) {
        return res.json({
          ok: false,
          errorMessage: "다른 사용자의 단어 뜻은 수정할 수 없습니다.",
        });
      }

      // 단어 뜻 첫자리 공백 검사
      const regexSpace = /^\s(\S*|\s)/;
      if (regexSpace.test(meaning)) {
        return res.json({
          ok: false,
          errorMessage: "첫 자리 공백은 허용되지 않습니다.",
        });
      }

      // 단어 뜻을 입력하지 않았을 경우 뜻 추가 불가
      if (!word || !meaning) {
        return res.json({
          ok: false,
          errorMessage: "단어 뜻을 입력하지 않았습니다.",
        });
      }

      // 욕설 필터링
      const isFword = await fWordsFilter(meaning);

      if (isFword) {
        return res.json({
          ok: false,
          errorMessage:
            "욕설 혹은 올바르지 않은 뜻을 등록하는 경우 건전한 서비스 환경 제공에 어려움이 있으므로 서비스 이용이 제한될 수 있습니다.",
        });
      }

      // 전체 단어 검색해서 현재 수정하려고 하는 뜻과 비교 후 이미 있는 단어 뜻일 경우 수정 불가
      let meaningList = []; // JSON 해체 후 meaning만 뽑아내서 리스트 만들기
      for (let findMeaning of findMeanings) {
        meaningList.push(findMeaning.meaning);
      }

      if (meaningList.includes(meaning)) {
        return res.json({
          ok: false,
          errorMessage: "이미 있는 단어 뜻입니다.",
        });
      }

      // 단어 뜻 20자리 이하만 입력 가능
      const regexRange = /^.{1,20}$/; // 영,한 상관없이 20자리

      // const regexRange = /^[ㄱ-ㅎㅏ-ㅣ가-힣\s]{1,20}$/; // 공백 가능, 한글만 10자리까지
      if (!regexRange.test(meaning)) {
        return res.json({
          ok: false,
          errorMessage: "단어 뜻을 20자 이내로 입력하세요",
        });
      }

      // 수정
      await Opendict.updateOne(
        { scriptId, wordId },
        { $set: { meaning: meaning } }
      );

      // 사용자가 나만의 단어장에 이 단어를 저장했는지?
      const findMydictWord = await Mydict.find({ nickname, scriptId, word });
      const isSavedMydict = findMydictWord.length === 0 ? false : true;

      res.json({
        ok: true,
        message: "단어 뜻 수정 성공",
        isSavedMydict,
      });
    } catch (error) {
      res.status(400).json({ ok: false, errorMessage: "단어 뜻 수정 실패" });
      console.error(`${error} 에러로 단어 뜻 수정 실패`);
    }
  };
}

function deleteWord() {
  return async (req, res) => {
    try {
      const nickname = res.locals.user.nickname;
      const { scriptId, word, wordId } = req.params;

      const findMeaning = await Opendict.findOne({ scriptId, wordId }); // 입력 받은 단어 뜻 필드 찾기

      // 오픈사전 단어장에 등록하지 않은 단어이거나, 이미 삭제 했을 때
      if (!findMeaning) {
        return res.json({
          ok: false,
          errorMessage:
            "단어를 등록하지 않으셨거나 이미 단어를 삭제하셨습니다.",
        });
      }

      // 본인이 등록한 단어 뜻만 삭제 가능
      if (nickname !== findMeaning.nickname) {
        return res.json({
          ok: false,
          errorMessage: "다른 사용자의 단어 뜻은 삭제할 수 없습니다.",
        });
      }

      // 이미 나만의 단어장에 단어를 저장한 사용자가 있는 경우 오픈사전 단어장에서 남아 있는 단어 뜻이 하나 밖에 없는 상황에서는 삭제 불가
      const findMydictWord = await Mydict.find({ scriptId, word });
      const findOpendictWord = await Opendict.find({ scriptId, word });

      if (findMydictWord.length > 0 && findOpendictWord.length === 1) {
        return res.json({
          ok: false,
          errorMessage:
            "이미 나만의 단어장에 단어를 저장한 사용자가 있어 삭제할 수 없습니다.",
        });
      }

      await Opendict.deleteOne({ scriptId, wordId });

      res.json({ ok: true, message: "단어 뜻 삭제 성공" });
    } catch (error) {
      res.status(400).json({ ok: false, errorMessage: "단어 뜻 삭제 실패" });
      console.error(`${error} 에러로 단어 뜻 삭제 실패`);
    }
  };
}
