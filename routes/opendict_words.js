const express = require("express");
const router = express.Router();
const {
  postWord,
  getWord,
  putWord,
} = require("../controller/opendict_words");

router.post("/:scriptId", postWord); // 단어 뜻 추가
router.get("/:scriptId", getWord); // 단어 뜻 조회
router.put("/:scriptId", putWord); // 단어 뜻 수정

module.exports = router;
