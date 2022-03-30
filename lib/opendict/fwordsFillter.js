// 욕설 필터링
const fs = require("fs");

const fWordsFilter = async (meaning) => {
  const fWords = await fs.promises.readFile(
    __dirname + "/../../fwords/fwords.txt",
    "utf8"
  ); // 옵션 : 인코딩방식(utf8)
  const isFword = fWords.split("\n").includes(meaning);

  return isFword;
};

module.exports = { fWordsFilter };
