const userId = res.local.user.userId
switch (true) {
  case (userId): 
    const checkMyScripts = await MyScripts.findOne({
      scriptId,
      userId,
    })
    if (checkMyScripts) {
      res.json({
        script,
        ok: true,
        exist: true, 
      });
      break;
    }
    else {
      res.json({
        script,
        ok: true, 
        exist: false,
    })
    break;
}
case (user === undefined): {
  res.json({
    script,
    ok: true,
})
break;
}
}