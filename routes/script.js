const express = require("express");
const router = express.Router();

const { scriptsList, scriptDetail } = require("../controller/script");
const  postScript = require("../migration/insert_Scripts")

router.post("/script", postScript.postScript);
// router.get("/script/:tagId", scriptsList);
// router.get("/detail/:scriptId", scriptDetail);

module.exports = router;
