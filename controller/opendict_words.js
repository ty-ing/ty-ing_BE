const Words = require("../models/words"); // 단어 스키마
const Script = require("../models/script");
const { find, updateOne } = require("../models/words");
const script = require("../models/script");

// 단어 뜻 추가
const postWord = async (req, res) => {
  try {
    const nickname = "nice";
    const { scriptId } = req.params;
    const { word, meaning } = req.body;
    const findByUser = await Words.findOne({ nickname, scriptId, word });

    // 한 유저당 하나의 단어 뜻만 입력 가능 (여러개 입력 원하면 (ex) 맛있는, 맛이 좋은) 다음과 같이 ,로 단어 넣어야 함.)
    if (findByUser) {
      return res.json({
        ok: false,
        errorMessage: "이미 단어를 등록하셨습니다.",
      });
    }

    // 이미 있는 단어일 경우 입력 불가
    const meaningFromFind = await Words.aggregate([
      { $match: { scriptId, word } },
      { $project: { meaning: 1 } },
    ]);

    let meaningList = [];
    for (let i of meaningFromFind) {
      meaningList.push(i.meaning);
    }

    if (meaningList.includes(meaning)) {
      return res.json({ ok: false, errorMessage: "이미 있는 단어입니다." });
    }

    // 단어 10자리 이하만 입력 가능
    // const regex = /^.{1,10}$/; // 영,한 상관없이 10자리
    const regex = /^[ㄱ-ㅎㅏ-ㅣ가-힣\s]{1,10}$/; // 공백 불가, 한글만 10자리까지

    if (!regex.test(meaning)) {
      return res.json({
        ok: false,
        errorMessage: "단어를 10자 이하로 입력하세요",
      });
    }

    // 추가
    await Words.create({ nickname, scriptId, word, meaning });
    res.json({ ok: true, message: "단어 뜻 추가 성공" });
  } catch (error) {
    res.json({ ok: false, errorMessage: "단어 뜻 추가 실패" });
    console.error(`${error} 에러로 단어 뜻 추가 실패`);
  }
};

// 단어 뜻 조회
const getWord = async (req, res) => {
  try {
    const { scriptId } = req.params;
    const { word } = req.body;

    const openDict = await Words.aggregate([
      { $match: { scriptId, word } },
      {
        $project: {
          nickname: 1,
          word: 1,
          meaning: 1,
        },
      },
    ]);

    // 조회
    res.json({ ok: true, message: "단어 뜻 조회 성공", openDict });
  } catch (error) {
    res.json({ ok: false, errorMessage: "단어 뜻 조회 실패" });
    console.error(`${error} 에러로 인해 단어 뜻 조회 실패`);
  }
};

// 단어 뜻 수정
const putWord = async (req, res) => {
  try {
    const nickname = "green";
    const { scriptId } = req.params;
    const { word, meaning } = req.body;

    const find = await Words.find({ nickname, scriptId, word });

    // 이미 있는 단어일 경우 수정 불가
    const meaningFromFind = await Words.aggregate([
      { $match: { scriptId, word } },
      { $project: { meaning: 1 } },
    ]);

    let meaningList = [];
    for (let i of meaningFromFind) {
      meaningList.push(i.meaning);
    }

    if (meaningList.includes(meaning)) {
      return res.json({ ok: false, errorMessage: "이미 있는 단어입니다." });
    }

    // 수정
    await Words.updateOne(
      { nickname, scriptId, word },
      { $set: { meaning: meaning } }
    );

    res.json({ ok: true, message: "단어 뜻 수정 완료" });
  } catch (error) {
    res.json({ ok: false, message: "단어 뜻 수정 실패" });
    console.error(`${error} 에러로 단어 뜻 수정 실패`);
  }
};

module.exports = {
  postWord, // 단어 뜻 추가, 수정
  getWord, // 단어 뜻 조회
  putWord, // 단어 뜻 수정
};
