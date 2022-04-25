const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../middlewares/auth-middleware");

const {
  likeUp,
  likeDown,
  getLike,

  dislikeUp,
  dislikeDown,
  getDislike,
} = require("../controller/opendict_likeDislike");

router.put("/likeUp/:scriptId/:wordId", AuthMiddleware, likeUp); 
router.put("/likeDown/:scriptId/:wordId", AuthMiddleware, likeDown); 
router.get("/like/:scriptId/:wordId", AuthMiddleware, getLike); 

router.put("/dislikeUp/:scriptId/:wordId", AuthMiddleware, dislikeUp);
router.put("/dislikeDown/:scriptId/:wordId", AuthMiddleware, dislikeDown); 
router.get("/dislike/:scriptId/:wordId", AuthMiddleware, getDislike); 

module.exports = router;
