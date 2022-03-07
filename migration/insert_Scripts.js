const Script = require("../models/script");
module.exports.postScript = async (req, res) => {
    try {
       await Script.create({
          scriptTitle : req.body.title || "A deer may have passed COVID-19 to a person, study suggests", //"String"
          scriptListId : ["지오그래픽"],
          scriptTag : ["동물"],
          scriptParagraph : [ "A white-tailed deer in Canada likely infected a human with coronavirus, according to new research. The case, reported in a preprint journal, would be the first known instance of a COVID-19 spillover from a white-tailed deer—a common species throughout North America—into another species.    Previous work has shown that the virus is circulating widely in U.S. white-tailed deer populations. Before this latest report, however, the virus appeared to be very similar to that found in nearby humans, suggesting that the deer likely were sickened by us—not the other way around.    Now, a team of 32 government and academic researchers in Canada has concluded in a new work posted in BioRxiv that in late 2021, more than a dozen white-tailed deer in Canada had been infected with coronavirus that had a constellation of “mutations that had not been previously observed among SARS-CoV-2 lineages.”    What’s more, further analysis revealed that a person who had close contact with white-tailed deer in Ontario was infected with the same variant of coronavirus. (It was detected as part of Canada’s standard genomic sampling of all COVID-19 cases in the area at the time.)    Together, those factors suggest that the virus had been circulating among deer and accumulated mutations as it hopped from one animal to the next, before ultimately being passed to a person. It’s possible the virus was transmitted first through another host species, such as a mink, though the genomic analysis suggests that direct transmission from deer to human is “the most likely scenario,” the authors write.    The preliminary research, which has not yet been peer-reviewed, is not a cause for alarm, experts say.    The chances of transmitting coronavirus between people remains much higher than contracting the virus from a deer, says Jüergen Richt, a veterinarian and director of the Center on Emerging and Zoonotic Infectious Diseases at Kansas State University, who was not involved with the work. ",
          "For the research, scientists took nose and tissue samples from 300 dead white-tailed deer in southwestern and eastern Ontario between November and December 2021. All the animals had been killed by hunters and were already being tested as part of an annual surveillance program for chronic wasting disease, which kills deer and their relatives. A few samples tested weren't usable, but the researchers found that 17 of 298 deer—6 percent of the animals—tested positive for a “new and highly divergent lineage” of the coronavirus.",
          "Their results also showed that the variant is an older version of COVID, one that predated Delta and Omicron, suggesting that coronavirus has been circulating among deer for a long time. After discovering the coronavirus cases, the study authors analyzed whether the deer virus would likely be able to evade an existing COVID vaccine and concluded it would likely still provide robust coverage. That’s good news, says Richt, who agrees that deer-to-human infection appears to be the most likely explanation for the human case in Ontario. But he notes that there likely are other virus variants in people and animals that haven’t yet been recorded, possibly making the picture more complex than we realize. “As a scientist, you always have to discuss what else could be happening if you aren’t 100 percent sure,” he says. It remains unknown if there are other human cases of the Ontario deer-related virus or if there have been other spillover events from deer to people, the Canadian team emphasizes. “The emergence of Omicron and the end of deer-hunting season has meant both human and [white-tailed deer] testing and genomic surveillance in this region has been limited since these samples were collected,” they wrote in the paper."
      ]
        });
      
        res.status(201).send({
          ok: true,
          message: "등록 완료",
        });
      } catch (err) {
        console.log(err);
        res.status(200).send({
          ok: false,
          errorMessage: "올바르지 않은 형식입니다.",
        });
      }
};
