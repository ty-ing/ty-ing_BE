const Opendict = require("../models/opendict");
const Mydict = require("../models/mydict");
const { fWordsFilter } = require("../lib/opendict/fwordsFillter");
const { findOpendictMeanings } = require("../lib/opendict/findOpendictMeanings");

module.exports.postWord = postWord();
module.exports.getWordForGuest = getWordForGuest();
module.exports.getWordForUser = getWordForUser();
module.exports.putWord = putWord();
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

      const regexSpace = /^\s(\S*|\s)/;
      if (regexSpace.test(meaning)) {
        return res.json({
          ok: false,
          errorMessage: "첫 자리 공백은 허용되지 않습니다.",
        });
      }

      if (!word || !meaning) {
        return res.json({
          ok: false,
          errorMessage: "단어 뜻을 입력하지 않았습니다.",
        });
      }

      const isFword = await fWordsFilter(meaning);

      if (isFword) {
        return res.json({
          ok: false,
          errorMessage:
            "욕설 혹은 올바르지 않은 뜻을 등록하는 경우 건전한 서비스 환경 제공에 어려움이 있으므로 서비스 이용이 제한될 수 있습니다.",
        });
      }

      const findUserMeaning = await Opendict.findOne({
        nickname,
        scriptId,
        word,
      });

      if (findUserMeaning) {
        return res.json({
          ok: false,
          errorMessage: "이미 단어 뜻을 등록하셨습니다.",
        });
      }

      const findMeanings = await Opendict.aggregate([
        { $match: { scriptId, word } },
        { $project: { _id: 0, meaning: 1 } },
      ]);

      let meaningList = [];
      for (let findMeaning of findMeanings) {
        meaningList.push(findMeaning.meaning);
      }

      if (meaningList.includes(meaning)) {
        return res.json({
          ok: false,
          errorMessage: "이미 있는 단어 뜻 입니다.",
        });
      }

      const regexRange = /^.{1,20}$/;

      if (!regexRange.test(meaning)) {
        return res.json({
          ok: false,
          errorMessage: "단어 뜻을 20자 이내로 입력하세요",
        });
      }

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

      const findAddedWord = await Opendict.findOne({
        nickname,
        scriptId,
        word,
      });

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

      const findMeaning = await Opendict.findOne({ scriptId, word });
      if (!findMeaning) {
        return res.json({ ok: false, errorMessage: "등록된 단어가 아닙니다." });
      }

      const findMeanings = await findOpendictMeanings(
        (options = { scriptId, word })
      );

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

      const findMeaning = await Opendict.findOne({ scriptId, word });
      if (!findMeaning) {
        return res.json({ ok: false, errorMessage: "등록된 단어가 아닙니다." });
      }

      let findMeanings = await findOpendictMeanings(
        (options = { scriptId, word, nickname })
      );

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
      const nickname = user.nickname;
      let { scriptId, word, wordId } = req.params;
      let { meaning } = req.body;
      word = word.toLowerCase();

      const findMeanings = await Opendict.find({ scriptId, word });
      const findMeaning = await Opendict.findOne({ scriptId, wordId });

      if (nickname !== findMeaning.nickname) {
        return res.json({
          ok: false,
          errorMessage: "다른 사용자의 단어 뜻은 수정할 수 없습니다.",
        });
      }

      const regexSpace = /^\s(\S*|\s)/;
      if (regexSpace.test(meaning)) {
        return res.json({
          ok: false,
          errorMessage: "첫 자리 공백은 허용되지 않습니다.",
        });
      }

      if (!word || !meaning) {
        return res.json({
          ok: false,
          errorMessage: "단어 뜻을 입력하지 않았습니다.",
        });
      }

      const isFword = await fWordsFilter(meaning);

      if (isFword) {
        return res.json({
          ok: false,
          errorMessage:
            "욕설 혹은 올바르지 않은 뜻을 등록하는 경우 건전한 서비스 환경 제공에 어려움이 있으므로 서비스 이용이 제한될 수 있습니다.",
        });
      }

      let meaningList = [];
      for (let findMeaning of findMeanings) {
        meaningList.push(findMeaning.meaning);
      }

      if (meaningList.includes(meaning)) {
        return res.json({
          ok: false,
          errorMessage: "이미 있는 단어 뜻입니다.",
        });
      }

      const regexRange = /^.{1,20}$/;

      if (!regexRange.test(meaning)) {
        return res.json({
          ok: false,
          errorMessage: "단어 뜻을 20자 이내로 입력하세요",
        });
      }

      await Opendict.updateOne(
        { scriptId, wordId },
        { $set: { meaning: meaning } }
      );

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

      if (!findMeaning) {
        return res.json({
          ok: false,
          errorMessage:
            "단어를 등록하지 않으셨거나 이미 단어를 삭제하셨습니다.",
        });
      }

      if (nickname !== findMeaning.nickname) {
        return res.json({
          ok: false,
          errorMessage: "다른 사용자의 단어 뜻은 삭제할 수 없습니다.",
        });
      }

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
