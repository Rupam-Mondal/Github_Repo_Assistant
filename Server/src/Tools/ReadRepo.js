import recursive from "recursive-readdir";
import fs from "fs/promises";
import path from "path";
import { Document } from "@langchain/core/documents";
import { v4 as uuidv4 } from "uuid";

const allowedExtensions = [
  ".js",
  ".ts",
  ".tsx",
  ".jsx",
  ".json",
  ".md",
  ".txt",
  ".py",
  ".java",
  ".go",
  ".cpp",
  ".c",
  ".css",
  ".html",
  ".yml",
  ".yaml",
];

const ignoredFolders = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "coverage",
];

export async function ReadRepository(repoId , repoPath) {
  const files = await recursive(repoPath, ignoredFolders);
  

  const documents = [];

  for (const file of files) {
    const ext = path.extname(file);

    if (!allowedExtensions.includes(ext)) continue;

    try {
      const content = await fs.readFile(file, "utf8");

      documents.push(
        new Document({
          pageContent: content,
          metadata: {
            repoId,
            source: file,
            extension: ext,
          },
        })
      );
    } catch (err) {
      console.log(`Skipping ${file}`);
    }
  }

  return documents;
}