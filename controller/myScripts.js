const MyScripts = require("../models/myScripts");

module.exports.postMyScript = async (req, res) => {
  await postMyScript(req, res);
};

module.exports.deleteMyScript = async (req, res) => {
    await deleteMyScript(req, res);
}

module.exports. showMyScript = async (req, res) => {
    await showMyScript(req, res);
}

async function postMyScript(req, res) {
  const {scriptId} = req.params;
  const userId = res.locals.user.userId
  const checkMyScripts = await MyScripts.findOne({
    scriptId: scriptId,
    userId: userId,
  });
  if (!checkMyScripts) {
    await MyScripts.create({
      scriptId,
      userId,
    });
    res.status(200).send({
        ok: true,
        message : "추가가 완료되었습니다."
    })
  } else {
    res.status(200).send({
      ok: false,
      errorMessage: "이미 내 스크립트 목록에 담겨져 있습니다.",
    });
  }
}

async function deleteMyScript(req, res) {
    const { scriptId } = req.params;
    const userId = res.locals.user.userId
    const checkMyScripts = await MyScripts.findOne({
        scriptId: scriptId,
        userId: userId,
      });
    if (!checkMyScripts) {
        res.status(200).send({
        ok: false,
        errorMessage: "내 스크립트 목록에 존재하지 않습니다.",
        });
        } else {
            await MyScripts.deleteOne({
                scriptId: scriptId,
                userId: userId, 
            })
        res.status(200).send({
            ok:true,
            message: "삭제가 완료되었습니다"
        })
    }
}

async function showMyScript(req, res) {
    const { scriptId } = req.params;
    const userId = res.locals.user.userId
    const checkMyScript = await MyScripts.findOne({
        scriptId: scriptId,
        userId: userId,
      });

      if (checkMyScript) {
          res.send({exist: true})
      } else {
          res.send({exist: false})
      }
}   