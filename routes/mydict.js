const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../middlewares/auth-middleware");

const { postMydict, getMydict, deleteMydict } = require("../controller/mydict");

// 나만의 단어장
router.post("/:scriptId/:word", AuthMiddleware, postMydict); // 등록
router.get("/", AuthMiddleware, getMydict); // 불러오기
router.delete("/:scriptId/:word", AuthMiddleware, deleteMydict); // 삭제

module.exports = router;
