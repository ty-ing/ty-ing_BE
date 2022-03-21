const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../middlewares/auth-middleware");

const {
  // 오픈사전 단어장
  // 좋아요
  likeUp,
  likeDown,
  getLike,

  // 싫어요
  dislikeUp,
  dislikeDown,
  getDislike,
} = require("../controller/opendict_likeDislike");

// 오픈사전 단어장
// 좋아요
router.put("/likeUp/:scriptId/:wordId", AuthMiddleware, likeUp); // 좋아요 누르기
router.put("/likeDown/:scriptId/:wordId", AuthMiddleware, likeDown); // 좋아요 취소
router.get("/like/:scriptId/:wordId", AuthMiddleware, getLike); // 좋아요 조회

// 싫어요
router.put("/dislikeUp/:scriptId/:wordId", AuthMiddleware, dislikeUp); // 싫어요 누르기
router.put("/dislikeDown/:scriptId/:wordId", AuthMiddleware, dislikeDown); // 싫어요 취소
router.get("/dislike/:scriptId/:wordId", AuthMiddleware, getDislike); // 싫어요 조회

module.exports = router;
