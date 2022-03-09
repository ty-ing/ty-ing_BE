const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');

const { signup, idCheck, nicknameCheck, login, auth } = require('../controller/users'); 

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

module.exports = router;