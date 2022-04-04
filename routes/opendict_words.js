const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../middlewares/auth-middleware");

const {
  // 오픈사전 단어장
  postWord,
  getWordForGuest,
  getWordForUser,
  putWord,
  deleteWord,
} = require("../controller/opendict_words");

// 오픈사전 단어장
router.post("/:scriptId/:word", AuthMiddleware, postWord); // 단어 뜻 추가
router.get("/guest/:scriptId/:word", getWordForGuest); // 단어 뜻 조회 게스트용
router.get("/user/:scriptId/:word", AuthMiddleware, getWordForUser); // 단어 뜻 조회 로그인한 사용자용
router.put("/:scriptId/:word/:wordId", AuthMiddleware, putWord); // 단어 뜻 수정
router.delete("/:scriptId/:word/:wordId", AuthMiddleware, deleteWord); // 단어 뜻 삭제

module.exports = router;
