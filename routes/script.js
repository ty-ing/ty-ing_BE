const express = require("express");
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');

const {
  findScript,
  scriptFilter,
  scriptDetail,
  searchScripts,
} = require("../controller/script");
const postScript = require("../migration/insert_Scripts");

router.post("/script", postScript.postScript);
router.get("/script/:scriptType/:scriptCategory", findScript);
router.get("/script/list", scriptFilter);
router.get("/script/search",authMiddleware, searchScripts);
router.get("/detail/:scriptId", scriptDetail);

module.exports = router;
