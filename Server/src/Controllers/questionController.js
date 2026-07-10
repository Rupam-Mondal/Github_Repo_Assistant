import { questionService } from "../Services/questionService.js";

export async function questionController(req , res){
    try {
        const question = req?.body?.question;
        const repoId = req?.body?.repoId;

        if (typeof repoId !== "string" || !repoId.trim()) {
            return res.status(400).json({
                success: false,
                message: "repoId is required",
            });
        }

        if (typeof question !== "string" || !question.trim()) {
            return res.status(400).json({
                success: false,
                message: "Question is required",
            });
        }

        const result = await questionService(repoId ,question);

        return res.json({
            success: true,
            message: "answered successfully",
            data:result
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `something went wrong :- ${error.message}`
        })
    }
}
