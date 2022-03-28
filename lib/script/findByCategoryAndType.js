const Script = require("../../models/script");

module.exports.findByCategoryAndType = async (options = {
    scriptCategory: null,
    scriptType: null,
}) => {
    let stage = []

    if(options.scriptType !== "all") {
        stage.push(
            { $match: { scriptType: options.scriptType } },
        )
    } else {
        stage.push(
            { $match : {}}
        )
    }

    if(options.scriptCategory !== "all") {
        stage.push(
            { $match: { scriptCategory: options.scriptCategory } },
        )
    } 

    stage.push(
        { $sample: { size: 1 } },
    )

    return Script.aggregate(stage)
}
