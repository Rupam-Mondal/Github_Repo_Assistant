import { VectorStore, VectorStoreRetriever } from "@langchain/core/vectorstores";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

const collectionName = "github_project";
const repoIdPayloadKey = "metadata.repoId";

async function ensureRepoIdIndex(vectorStore) {
    const collection = await vectorStore.client.getCollection(collectionName);

    if (collection.payload_schema?.[repoIdPayloadKey]) return;

    await vectorStore.client.createPayloadIndex(collectionName, {
        field_name: repoIdPayloadKey,
        field_schema: "keyword",
        wait: true,
    });
}

export async function questionService(repoId , question){
    try {
        if (typeof repoId !== "string" || !repoId.trim()) {
            throw new Error("repoId is required");
        }

        if (typeof question !== "string" || !question.trim()) {
            throw new Error("Question is required");
        }

        const embeddings = new OpenAIEmbeddings({
            model:'text-embedding-3-small',
            apiKey:process.env.OPENAI_API_KEY
        })

        const vectorStore = await QdrantVectorStore.fromExistingCollection(
            embeddings,
            {
                url: process.env.QDRUNT_LINK,
                apiKey: process.env.QDRUNT_KEY,
                collectionName,
            }
        )
        await ensureRepoIdIndex(vectorStore);

        const vectorRetriver = vectorStore.asRetriever({
            k : 10,
            filter:{
                must:[
                    {
                        key: repoIdPayloadKey,
                        match:{
                            value: repoId.trim()
                        }
                    }
                ]
            }
        });
        const result = await vectorRetriver.invoke(question);

        console.log(result)

        const System_Prompt = `
        You are an expert og giving answer related gitub repositories. You will be
        given some contect on some files of project and user will ask question on that context
        you have analyse the context or document given and answer the user's answer correctly.
        after getting the question you have to answer in which file the code is written and how the
        feature is implemented. try to give details answer on user question. If a question is irrevalent
        tell the user 'no feature is found in the project like that'. do not reply with too many text, if needed
        you can give long answer but still try to give simple crisp answer.  below the document is given
        before answer analyse the document analyse the user query then answer efficiently

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
