const express = require("express");
const router = express.Router();

const { scriptsListId, scriptTag, scriptDetail } = require("../controller/script");
const  postScript = require("../migration/insert_Scripts")

router.post("/script", postScript.postScript);
router.get("/script/list/:scriptListId", scriptsListId);
router.get("/script/tag/:scriptTag", scriptTag);
router.get("/detail/:scriptId", scriptDetail);

module.exports = router;
