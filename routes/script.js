const express = require("express");
const router = express.Router();

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
router.get("/search/:targetWord", searchScripts);
router.get("/detail/:scriptId", scriptDetail);

module.exports = router;
