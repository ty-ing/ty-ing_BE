const MyScripts = require("../models/myScripts");

//나만의 스크립트 등록하기
module.exports.postMyScript = async (req, res) => {
  await postMyScript(req, res);
};

// 나만의 스크립트에서 삭제하기
module.exports.deleteMyScript = async (req, res) => {
    await deleteMyScript(req, res);
}

// 나만의 스크립트에 담겨져 있는지 여부 확인(상세페이지용)
module.exports. showMyScript = async (req, res) => {
    await showMyScript(req, res);
} 

async function postMyScript(req, res) {
  const {scriptId} = req.params;
  const id = res.locals.user.id
  const checkMyScripts = await MyScripts.findOne({
    scriptId: scriptId,
    userId: id,
  });
  if (!checkMyScripts) {
    await MyScripts.create({
    scriptId,
    userId:id
    });
    res.status(201).json({
        ok: true,
        message : "추가가 완료되었습니다."
    })
  } else {
    res.status(200).json({
      ok: false,
      errorMessage: "이미 내 스크립트 목록에 담겨져 있습니다.",
    });
  }
}

async function deleteMyScript(req, res) {
    const { scriptId } = req.params;
    const id = res.locals.user.id
    const checkMyScripts = await MyScripts.findOne({
        scriptId: scriptId,
        userId: id,
      });
    if (!checkMyScripts) {
        res.status(200).json({
        ok: false,
        errorMessage: "내 스크립트 목록에 존재하지 않습니다.",
        });
        } else {
            await MyScripts.deleteOne({
                scriptId: scriptId,
                userId: id, 
            })
        res.status(200).json({
            ok:true,
            message: "삭제가 완료되었습니다"
        })
    }
}

async function showMyScript(req, res) {
    const { scriptId } = req.params;
    const id = res.locals.user.id
    const checkMyScript = await MyScripts.findOne({
        scriptId: scriptId,
        userId: id,
      });

      if (checkMyScript) {
          res.status(200).json({saved: true})
      } else {
          res.status(200).json({saved: false})
      }
}   