import { Redis } from "@upstash/redis";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";

export type CompanionKey = {
    companionName: string;
    modelName: string;
    userId: string;
}

export class MemoryManager {
    private static instance: MemoryManager;
    private history: Redis;
    private vectorDBClient: PineconeClient;

    public constructor() {
        this.history = Redis.fromEnv();
        this.vectorDBClient = new PineconeClient();
    }

    public async init() {
        if (this.vectorDBClient instanceof PineconeClient) {
            await this.vectorDBClient.init({
                apiKey: process.env.PINECONE_API_KEY!,
                environment: process.env.PINECONE_ENVIRONMENT!,
            })
            // placing an exclamation point ( ! ) after an optional value forces the unwrapping of its value
        }
    }

    public async vectorSearch(
        recentChatHistory: string,
        companionFileName: string
    ) {
        const pineconeClient = <PineconeClient>this.vectorDBClient;

        const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX! || "");

        const vectorStore = await PineconeStore.fromExistingIndex(
            new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }), { pineconeIndex }
        );

        const similarDocs = await vectorStore
            .similaritySearch(recentChatHistory, 3, { filename: companionFileName })
            .catch((err) => {
                console.log("Failed to get vector search results", err)
            });

        return similarDocs;
    }

    public static async getInstance(): Promise<MemoryManager> {
        if(!MemoryManager.instance) {
            MemoryManager.instance = new MemoryManager();
            await MemoryManager.instance.init();
        }

        return MemoryManager.instance;
    }

    // Private method can only be called within the class
    private generateRedisCompanionKey(companionKey: CompanionKey): string {
        // Key is 'name-model-userID' to find a unique history for this user with this buddy / model
        return `${companionKey.companionName}-${companionKey.modelName}-${companionKey.userId}`
    }

    public async writeToHistory(text: string, companionKey: CompanionKey) {
        if (!companionKey || typeof companionKey.userId == "undefined") {
            console.log("Companion key set incorrectly");
            return "";
        }

        // Need key to write history to Redis
        const key = this.generateRedisCompanionKey(companionKey);
        const result = await this.history.zadd(key, {
            score: Date.now(),
            member: text,
        }); //zadd is a function of Redis, used here to add recent message to history

        return result;
    }

    public async readLatestHistory(companionKey: CompanionKey): Promise<string> {
        if (!companionKey || typeof companionKey.userId == "undefined") {
            console.log("Companion key set incorrectly");
            return "";
        }

        // Need key to fetch history from Redis
        const key = this.generateRedisCompanionKey(companionKey);
        let result = await this.history.zrange(key, 0, Date.now(), {
            byScore: true
        }); //zrange is a Redis function that takes these parameters - key, min, max, optionals

        result = result.slice(-30).reverse(); //last 30 messages from result in reverse order

        const recentChats = result.reverse().join("\n"); //Join all the 30 messages with \n between lines
        return recentChats;
    }

    public async seedChatHistory(
        seedContent: String,
        delimeter: string = "\n",
        companionKey: CompanionKey
    ) {
        const key = this.generateRedisCompanionKey(companionKey);

        if (await this.history.exists(key)) {
            console.log("User already has chat history. Seeding not needed");
            return;
        }

        const content = seedContent.split(delimeter);
        let counter = 0;

        for (const line of content) {
            await this.history.zadd(key, { score: counter, member: line });
            counter +=1
        }
    }

}