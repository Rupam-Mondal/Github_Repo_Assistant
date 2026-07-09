import simpleGit from "simple-git";
import path from "path";
import fs from "fs/promises";

export async function Clone(url) {
  try {
    const git = simpleGit();
    
    const repoName = url.split("/").pop().replace(".git", "");

    const clonePath = path.join(process.cwd(), "repos", repoName);


    await fs.mkdir(path.join(process.cwd(), "repos"), {
      recursive: true,
    });

    await git.clone(url, clonePath);
    console.log("Repository cloned successfully!");

    return clonePath;


  } catch (error) {
    throw error;
  }
}
