import { questionService } from "../Services/questionService.js";

export async function questionController(req , res){
    try {
        const question = req?.body?.question;
        const repoId = req?.body?.repoId;

        console.log(repoId)

        if(!question) throw new Error("Question is undefined");

        const result = await questionService(repoId ,question);

        return res.json({
            success: true,
            message: "answered successfully",
            data:result
        })
    } catch (error) {
        return res.json({
            success: false,
            message: `something went wrong :- ${error.message}`
        })
    }
}