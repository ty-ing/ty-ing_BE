const Users = require("../models/users"); // 유저 스키마
const jwt = require("jsonwebtoken"); // jwt 토큰 사용
const Joi = require("joi"); // 유효성 검증 라이브러리
const bcrypt = require("bcrypt");
const passport = require("passport");
const res = require("express/lib/response");

// 이메일 중복확인 validate 할 스키마 .
const idCheckSchema = Joi.object({
  id: Joi.string().required(),
});

// 이메일 중복확인
const idCheck = async (req, res) => {
  try {
    const { id } = await idCheckSchema.validateAsync(req.body); // Joi 유효성 검사
    const existId = await Users.findOne({ id }); // User document 안에서 id 있는지 찾음.

    if (!existId) {
      return res.json({ ok: true, message: "사용가능한 아이디입니다." });
    }

    res.json({ ok: false, message: "이미 사용중인 아이디입니다." });
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: `아이디 중복확인을 실패하였습니다`, // Joi 유효성 탈락, 오타 등
    });
    console.error(`아이디 중복확인에서 ${error}에러가 발생하였습니다.`);
  }
};

// 닉네임 중복확인 validate 할 스키마 .
const nicknameCheckSchema = Joi.object({
  nickname: Joi.string().required(),
});

// 닉네임 중복확인
const nicknameCheck = async (req, res) => {
  try {
    const { nickname } = await nicknameCheckSchema.validateAsync(req.body); // Joi 유효성 검사
    const existNickname = await Users.findOne({ nickname }); // User document 안에서 id 있는지 찾음.

    if (!existNickname) {
      return res.json({ ok: true, message: "사용가능한 닉네임입니다." });
    }

    res.json({ ok: false, message: "이미 사용중인 닉네임입니다." });
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: `닉네임 중복확인을 실패하였습니다`, // Joi 유효성 탈락, 오타 등
    });
    console.error(`아이디 중복확인에서 ${error}에러가 발생하였습니다.`);
  }
};

// 회원가입 validate할 스키마
const signupSchema = Joi.object({
  id: Joi.string().required(),
  nickname: Joi.string().required(),
  pwd: Joi.string().required()
});

// 회원가입
const signup = async (req, res) => {
  try {
    const { id, nickname, pwd } =
      await signupSchema.validateAsync(
        // Joi 유효성 검사
        req.body
      );
    const existId = await Users.findOne({ id }); // User document 안에서 email 있는지 찾음.
    const existNickname = await Users.findOne({ nickname });

    if (existId) {
      return res.json({ ok: true, message: "아이디 중복체크를 해주세요." });
    }

    if (existNickname) {
      return res.json({ ok: true, message: "닉네임 중복체크를 해주세요." });
    }

    const encodedPassword = bcrypt.hashSync(pwd, 10);
    await Users.create({ id, userId: Date.now(), nickname, pwd: encodedPassword, provider: "local" });
    res.json({ ok: true, message: "회원가입이 성공적으로 완료되었습니다." });
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: "회원가입을 실패하였습니다.", // Joi 유효성 탈락, 오타 등
    });
    console.error(`회원가입에서 ${error}에러가 발생하였습니다.`);
  }
};

// 로그인 validate할 스키마
const loginSchema = Joi.object({
  id: Joi.string().required(),
  pwd: Joi.string().required(),
});

const login = async (req, res) => {
  try {
    const { id } = await loginSchema.validateAsync(req.body);
    const { pwd } = await loginSchema.validateAsync(req.body);
    const user = await Users.findOne({ id }); // db에 저장된 user 회원 가입 정보 있는지 찾음

    if (!user) {
      // 아이디 검사
      return res.json({
        ok: false,
        message: "아이디 또는 패스워드가 잘못되었습니다.", // 보안을 위해 메시지를 명시적으로 보내지 않음
      });
    }

    if (!bcrypt.compareSync(pwd, user.pwd)) {
      // 비밀번호 검사 (입력받은 비밀번호, 디비에 있는 암호화된 비밀번호 비교해줌)
      return res.json({
        ok: false,
        message: "아이디 또는 패스워드가 잘못되었습니다.",
      });
    }

    const token = jwt.sign({ id: user.id }, process.env.TOKENKEY, { expiresIn: '60m'}); // 사용자를 구분하기 위해서 id를 JWT에 저장해주고 토큰 생성
    console.log(user.id);
    res.json({
      ok: true,
      message: "로그인이 성공적으로 완료되었습니다.",
      token,
      id: user.id,
      nickname: user.nickname,
      userId: user.userId,
    });
  } catch (error) {
    res.json({ ok: false, message: `로그인을 실패하였습니다.` });
    console.error(`로그인에서  ${error}가 발생했습니다.`);
  }
};

// 로그인 정보 불러오기 (auth-middleware에서 locals에 저장해놓은 거 가져오기)
const auth = async (req, res) => {
  try {
    const user = res.locals.user;
    res.json({
      ok: true,
      message: "로그인 정보 불러오기 성공",
      id: user.id,
      nickname: user.nickname,
      userId: user.userId,
    });
  } catch (error) {
    res.json({
      ok: false,
      message: `로그인 정보 불러오기 실패`,
    });
    console.error(`로그인 정보 불러오기에서 ${error}가 발생했습니다.`);
  }
};

const kakaoCallback = (req, res, next) => {
  passport.authenticate(
    "kakao",
    { failureRedirect: "/" },
    (err, user, info) => {
      if (err) return next(err);
      const { id, } = user;
      const token = jwt.sign({ id, }, process.env.TOKENKEY,{ expiresIn: '60m'});
      result = {
        token,
        id: user.id,
        nickname: user.nickname,
      };
      res.send({ user: result });
    }
  )(req, res, next);
};

module.exports = {
  idCheck, // 회원가입에서 아이디 중복검사
  nicknameCheck, // 회원가입에서 닉네임 중복검사
  signup, // 회원가입
  login, // 로그인
  auth,
  kakaoCallback // 로그인 정보 불러오기 (auth-middleware에 저장된 거)
};
