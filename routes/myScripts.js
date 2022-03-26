const express = require("express");
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');

const {
    postMyScript,
    deleteMyScript,
    showMyScript,
} = require("../controller/myScripts");

router.get("/myScript/:scriptId",authMiddleware, showMyScript);
router.post("/myScript/:scriptId" ,authMiddleware, postMyScript);
router.delete("/myScript/:scriptId",authMiddleware, deleteMyScript);


module.exports = router;
