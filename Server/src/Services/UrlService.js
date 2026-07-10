import {PDFLoader} from '@langchain/community/document_loaders/fs/pdf';
import {OpenAIEmbeddings} from "@langchain/openai";
import {QdrantVectorStore} from "@langchain/qdrant";
import dotenv from 'dotenv';
import { Clone } from "../Tools/CloneRepo.js";
import { ReadRepository } from '../Tools/ReadRepo.js';

dotenv.config();

export async function UrlService(url){
    try {
        const clonepath = await Clone(url);

        const documents = await ReadRepository(clonepath);
        
        
    } catch (error) {
        throw error;
    }
}