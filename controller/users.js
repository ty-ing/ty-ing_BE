const Users = require("../models/users"); // 유저 스키마
const Studyrecord = require("../models/studyrecord");
const Opendict = require("../models/opendict");
const Mydict = require("../models/mydict");
const jwt = require("jsonwebtoken"); // jwt 토큰 사용
const Joi = require("joi"); // 유효성 검증 라이브러리
const bcrypt = require("bcrypt");
const passport = require("passport");
const Script = require("../models/script");

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

const updateUserInfo = async (req, res) => {
  try {
    const { id } = res.locals.user;
    const { nickname } = await nicknameCheckSchema.validateAsync(req.body); // Joi 유효성 검사
    
    await Users.updateOne({ id },{ $set: { nickname }})

    // 오픈사전 단어장에 등록되어 있는 닉네임 변경
    await Opendict.updateMany({id}, {$set : {nickname : nickname} })

    // 나만의 단어장에 등록되어 있는 닉네임 변경
    await Mydict.updateMany({id}, {$set : {nickname : nickname} })

    res.status(201).json({ ok: true, message: "수정 완료" });
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: "수정 실패" 
    });
  }
}

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

    const token = jwt.sign({ id: user.id, nickname: user.nickname }, process.env.TOKENKEY, { expiresIn: '2h'}); // 사용자를 구분하기 위해서 id를 JWT에 저장해주고 토큰 생성
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
    (err, user) => {
      if (err) return next(err);
      const { id, nickname } = user;
      const token = jwt.sign({ id, nickname }, process.env.TOKENKEY, { expiresIn: '2h'});
      result = {
        token,
        id: user.id,
        nickname: user.nickname,
      };
      res.send({ user: result });
    }
  )(req, res, next);
};

const studyrecord = async (req, res) => {
  try {
    const id = res.locals.user.id;
    const { scriptId, scriptTitle, scriptType, time, typingCnt, duration, progress, speed} = req.body;
    const date = new Date(+new Date() + 3240 * 10000).toISOString();
    const datestring = new Date(+new Date() + 3240 * 10000).toISOString().replace(/\T.*/,'');
  
    await Studyrecord.create({ id, scriptTitle, scriptId, scriptType, time, typingCnt, date, duration, datestring, progress, speed});
    res.json({
      ok: true,
      message: "등록 완료"
    });
    } catch (error){
    res.json({
      ok: false,
      message: "등록 실패"
    });
    console.error(`${error} 에러로 등록 실패`);
  }
};

  const statistic = async (req, res) => {
    try {
      const id = res.locals.user.id;
      const nickname = res.locals.user.nickname;
      const {startdate,enddate} = req.body;
      const getrecord = await Studyrecord.aggregate([
        { $match: {$or:[{ date: {$gte:new Date(startdate), $lte: new Date(enddate)}}],id }},
        { $group: { _id : '$datestring', total_typingCnt : { $sum : '$typingCnt'}, total_duration : { $sum : '$duration'}}},
      ]);
      res.json({
        ok: true,
        message: "조회 완료",
        id,
        nickname,
        getrecord
      });
    } catch (error) {
      res.json({
        ok: false,
        message: "조회 실패",
    });
    console.error(`${error} 에러로 조회 실패`);
  };
}

const certificate = async (req, res) => {
  try {
  const id = res.locals.user.id;
  const nickname = res.locals.user.nickname;
  const getcertificate = await Studyrecord.find({ id }).sort("-certificateId");

    res.json({
      ok:true,
      message:"조회 완료",
      id,
      nickname,
      getcertificate
    });
  } catch (error) {
    res.json({
      ok:false,
      message:"조회 실패"
    })
    console.error(`${error} 에러로 조회 실패`);
  }
}

const certificatedetail = async (req, res) => {
  try {
  const { certificateId, scriptId } = req.params;
  const getscript = await Script.findOne({ scriptId });
  const getcertificatedetail = await Studyrecord.findOne({certificateId});
    res.json({
      ok:true,
      message: "조회 성공",
      scriptTitle: getscript.scriptTitle,
      scriptType: getscript.scriptType,
      scriptCategory: getscript.scriptCategory,
      scriptTopic: getscript.scriptTopic,
      getcertificatedetail
    })
  } catch (error) {
    res.json({
      ok:false,
      message:"조회 실패"
    })
    console.error(`${error} 에러로 조회 실패`);
  }
}
module.exports = {
  idCheck, // 회원가입에서 아이디 중복검사
  nicknameCheck, // 회원가입에서 닉네임 중복검사
  signup, // 회원가입
  login, // 로그인
  auth, // 로그인 정보 불러오기 (auth-middleware에 저장된 거)
  updateUserInfo, // 유저 정보 수정
  kakaoCallback, // 카카오 로그인
  studyrecord, // 스크립트 결과 저장
  statistic, // 마이페이지(통계)
  certificate, // 마이페이지(인증서)
  certificatedetail // 마이페이지(인증서 상세보기)
};
