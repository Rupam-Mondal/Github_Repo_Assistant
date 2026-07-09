import { UrlService } from "../Services/UrlService.js";
import { isGitHubUrl } from "../Tools/GithubLinkChecker.js";

export async function UrlController(req , res){
    try {
        const repoUrl = req?.body?.url;
        if(!repoUrl){
            throw new Error("URL is not present");
        }

        const validateGithubURl = isGitHubUrl(repoUrl);
        if(!validateGithubURl){
            throw new Error("Invalid Github URL")
        }

        const result = await UrlService(repoUrl);
        return res.json({
            success: true,
            message:"Repo is cloned and content is vectored successfully",
            data: result
        })
    } catch (error) {
        return res.json({
            success: false,
            message: `Url Controller failed :- ${error.message}`,
        })
    }
}