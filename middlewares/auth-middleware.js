const jwt = require('jsonwebtoken');
const Users = require('../models/users');

// 인증
module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  const [authType, authToken] = (authorization || '').split(' ');

  //인증 Bearer 타입 아니면 거르기
  if (!authToken || authType !== 'Bearer') {
    res.send({
      errorMessage: '로그인 후 이용 가능한 기능입니다.',
    });
    return;
  }

  //로그인정보 저장해놓기
  try {
    const { id } = jwt.verify(authToken, process.env.TOKENKEY);
  
    Users.findOne({id}).then((user) => {
      res.locals.user = user; //굳이 데이터베이스에서 사용자 정보를 가져오지 않게 할 수 있도록 express가 제공하는 안전한 변수에 담아두고 언제나 꺼내서 사용할 수 있게함
      next();
    });
  } catch (err) {
    if(err.name === "TokenExpiredError"){
      res.send({
        ok: false,
        message: '토큰 유효기간이 끝났습니다. 다시 로그인 해주세요'
      });
      return;
    } else {
    res.send({
      ok: false,
      errorMessage: '비정상적인 토큰입니다. 다시 로그인 해주세요',
    });
    return;
  }
}
};