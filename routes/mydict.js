const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../middlewares/auth-middleware");

const { postMydict, getMydictSome, getMydictAll, deleteMydict } = require("../controller/mydict");

// 나만의 단어장
router.post("/:scriptId/:word", AuthMiddleware, postMydict); // 등록
router.get("/some", AuthMiddleware, getMydictSome); // 불러오기
router.get("/all", AuthMiddleware, getMydictAll); // 불러오기
router.delete("/:scriptId/:word", AuthMiddleware, deleteMydict); // 삭제

module.exports = router;
