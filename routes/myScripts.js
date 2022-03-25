const express = require("express");
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');

const {
    postMyScript,
    deleteMyScript,
    showMyScript,
} = require("../controller/myScripts");

router.post("/myScript/:scriptId" ,authMiddleware, postMyScript);
router.delete("/myScript/:scriptId",authMiddleware, deleteMyScript);
router.get("/myScript/:scriptId",authMiddleware, showMyScript);

module.exports = router;
