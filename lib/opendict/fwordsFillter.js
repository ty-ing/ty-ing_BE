const fs = require("fs");

module.exports.fWordsFilter = async (meaning) => {
  const fWords = await fs.promises.readFile(
    __dirname + "/../../fwords/fwords.txt",
    "utf8"
  );
  const isFword = fWords.split("\n").includes(meaning);

  return isFword;
};