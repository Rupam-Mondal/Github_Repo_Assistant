import { VectorStore, VectorStoreRetriever } from "@langchain/core/vectorstores";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function questionService(question){
    try {
        const embeddings = new OpenAIEmbeddings({
            model:'text-embedding-3-small',
            apiKey:process.env.OPENAI_API_KEY
        })

        const vectorStore = await QdrantVectorStore.fromExistingCollection(
            embeddings,
            {
                url: process.env.QDRUNT_LINK,
                apiKey: process.env.QDRUNT_KEY,
                collectionName: "github_project",
            }
        )
        const vectorRetriver = vectorStore.asRetriever({k : 5});
        const result = await vectorRetriver.invoke(question);

        const System_Prompt = `
        You are an expert in answering user quesry on the context provided to you
        do not answer any question beyong that. you will be given
        some context on some files with chunks you have to say the user in which file and how it
        is implemented. try to answer in short do not write too much

        user documents :- ${result.map(e => JSON.stringify(e))}
        `

        console.log(System_Prompt);

        const response = await client.chat.completions.create({
        model:'gpt-4o-mini',
        messages:[
                {
                    role:'system',
                    content:System_Prompt
                },
                {
                    role:'user',
                    content:question
                }
            ]
        })

        console.log(`LLM response:- ${response.choices[0].message.content}`);


        return response.choices[0].message.content;

        
    } catch (error) {
        throw error
    }
}