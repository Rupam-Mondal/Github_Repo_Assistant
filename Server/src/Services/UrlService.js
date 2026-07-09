import { Clone } from "../Tools/CloneRepo.js";

export async function UrlService(url){
    try {
        const clonepath = await Clone(url);
        return clonepath
    } catch (error) {
        throw error;
    }
}