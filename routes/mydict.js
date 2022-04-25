const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../middlewares/auth-middleware");

const { postMydict, getMydictSome, getMydictAll, deleteMydict } = require("../controller/mydict");

router.post("/:scriptId/:word", AuthMiddleware, postMydict); 
router.get("/some", AuthMiddleware, getMydictSome); 
router.get("/all", AuthMiddleware, getMydictAll); 
router.delete("/:scriptId/:word", AuthMiddleware, deleteMydict); 

module.exports = router;
