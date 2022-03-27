    const Script = require("../../models/script");
    const MyScripts = require("../../models/myScripts");

module.exports.findByCategoryAndTopic = async (options = {
    scriptCategory: null,
    scriptTopic: null,
    isMyScript: null,
    userId: null,
    additionalStage: null,
}) => {

    let stage = []

    if(options.isMyScript){
        stage.push(
            {$match : {userId : options.userId},},
            {
                $lookup: {
                from: "scripts",
                localField: "scriptId",
                foreignField: "scriptId",
                pipeline: [
                    {
                    $project: { _id: 0,  __v: 0 },
                    },
                ],
                as: "scripts",
                },
            },
        )

        if( typeof options.additionalStage === 'object' ){
            stage = [...stage, ...options.additionalStage]
        }
        return MyScripts.aggregate([stage])
    }

    if(options.scriptCategory !== "all"){
        const scriptCategoryList = options.scriptCategory.split("|");
        stage.push(
            {
              $match: {
                scriptCategory: { $in: scriptCategoryList },
              },
            },
        )
    }else{
        stage.push(
            {
              $match: {},
            },
        )
    }

    if(options.scriptTopic !== "all"){
        const scriptTopicList = options.scriptTopic.split("|");
        stage.push(
            {
              $match: {
                scriptTopic: { $in: scriptTopicList },
              },
            },
        )
    }

    if( typeof options.additionalStage === 'object' ){
        stage = [...stage, ...options.additionalStage]
    }

    return Script.aggregate([stage])
}
