import {PDFLoader} from '@langchain/community/document_loaders/fs/pdf';
import {OpenAIEmbeddings} from "@langchain/openai";
import {QdrantVectorStore} from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import dotenv from 'dotenv';
import fs from "fs/promises";
import { Clone } from "../Tools/CloneRepo.js";
import { ReadRepository } from '../Tools/ReadRepo.js';
import { v4 as uuidv4 } from "uuid";

dotenv.config();

export async function UrlService(url){
    try {
        const clonepath = await Clone(url);
        const repoId = uuidv4();
        

        const documents = await ReadRepository(repoId , clonepath);
        console.log(documents.length);

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        const chunks = await splitter.splitDocuments(documents);

        console.log("Chunks :", chunks.length);

        const embeddings = new OpenAIEmbeddings({
            model: "text-embedding-3-small",
            apiKey: process.env.OPENAI_API_KEY,
        });

        const vectorStore = await QdrantVectorStore.fromExistingCollection(
            embeddings,
            {
                url: process.env.QDRUNT_LINK,
                apiKey: process.env.QDRUNT_KEY,
                collectionName: "github_project",
            }
        );

        await vectorStore.addDocuments(chunks);

        await fs.rm(clonepath, {
            recursive: true,
            force: true,
        });

        return {
            files: documents.length,
            chunks: chunks.length,
            repoId
        }
        
        
    } catch (error) {
        throw error;
    }
}