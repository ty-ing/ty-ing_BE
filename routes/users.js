const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const passport = require("passport");

const { signup, idCheck, nicknameCheck, login, auth, updateUserInfo, studyrecord, kakaoCallback } = require('../controller/users'); 

// 회원가입
router.post('/signup', signup);

// 회원가입 아이디 중복검사
router.post('/signup/idCheck', idCheck);

// 회원가입 닉네임 중복검사
router.post('/signup/nicknameCheck', nicknameCheck);

// 로그인
router.post('/login', login);

// 로그인 정보 불러오기
router.get('/auth', authMiddleware, auth);

// 회원 정보 변경
router.put('/info', authMiddleware, updateUserInfo);

// 결과 저장
router.post('/studyrecord', authMiddleware, studyrecord);

// 마이페이지
// router.get('/mypage', authMiddleware, mypage);

// 카카오 로그인
router.get("/kakao", passport.authenticate("kakao"));
router.get("/kakao/callback", kakaoCallback);

module.exports = router;