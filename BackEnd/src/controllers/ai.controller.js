const aiservice = require("../services/ai.service")

module.exports.getReview = async  (req,res) => {
    const code  = req.body.code;

    if(!code){
        return res.status(400).send("prompt is required");
    }


    const response = await aiservice(code);
    res.send(response); 

}