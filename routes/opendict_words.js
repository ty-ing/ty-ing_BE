const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../middlewares/auth-middleware");

const {
  postWord,
  getWordForGuest,
  getWordForUser,
  putWord,
  deleteWord,
} = require("../controller/opendict_words");

router.post("/:scriptId/:word", AuthMiddleware, postWord); 
router.get("/guest/:scriptId/:word", getWordForGuest); 
router.get("/user/:scriptId/:word", AuthMiddleware, getWordForUser); 
router.put("/:scriptId/:word/:wordId", AuthMiddleware, putWord); 
router.delete("/:scriptId/:word/:wordId", AuthMiddleware, deleteWord); 

module.exports = router;
