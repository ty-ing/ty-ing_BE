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

  // 좋아요
  likeUp,
  likeDown,
  getLike,

  // 싫어요
  dislikeUp,
  dislikeDown,
  getDislike,
} = require("../controller/opendict_words");

// 오픈사전 단어장
router.post("/:scriptId/:word", AuthMiddleware, postWord); // 단어 뜻 추가
router.get("/guest/:scriptId/:word", getWordForGuest); // 단어 뜻 조회 게스트용
router.get("/user/:scriptId/:word", AuthMiddleware, getWordForUser); // 단어 뜻 조회 로그인한 사용자용
router.put("/:scriptId/:word/:wordId", AuthMiddleware, putWord); // 단어 뜻 수정
router.delete("/:scriptId/:wordId", AuthMiddleware, deleteWord); // 단어 뜻 삭제

// 좋아요
router.put("/likeUp/:scriptId/:wordId", AuthMiddleware, likeUp); // 좋아요 누르기
router.put("/likeDown/:scriptId/:wordId", AuthMiddleware, likeDown); // 좋아요 취소
router.get("/like/:scriptId/:wordId", AuthMiddleware, getLike); // 좋아요 조회

// 싫어요
router.put("/dislikeUp/:scriptId/:wordId", AuthMiddleware, dislikeUp); // 싫어요 누르기
router.put("/dislikeDown/:scriptId/:wordId", AuthMiddleware, dislikeDown); // 싫어요 취소
router.get("/dislike/:scriptId/:wordId", AuthMiddleware, getDislike); // 싫어요 조회

module.exports = router;
