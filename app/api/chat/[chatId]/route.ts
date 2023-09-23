import { StreamingTextResponse, LangChainStream } from "ai";
import { auth, currentUser } from "@clerk/nextjs";
import { CallbackManager } from "langchain/callbacks";
import { Replicate } from "langchain/llms/replicate";
import { NextResponse } from "next/server";

import { MemoryManager } from "@/lib/memory";
import { rateLimit } from "@/lib/rate-limit";
import prismadb from "@/lib/prismadb";
import axios from "axios";

export async function POST(request: Request, { params }: { params: { chatId: string }}) {
    try {
        
        const { prompt } = await request.json();
        const user = await currentUser()

        if(!user || !user.id) {
            return new NextResponse("unauthorized", { status: 401 });
        }

        const identifier = request.url + "-" + user.id; //rate limiting each user for each request
        const { success } = await rateLimit(identifier);

        if (!success) {
            return new NextResponse("Rate limit exceeded", { status: 429 }) //429 means too many messages
        }

        // Fetch companion information using chat ID. Since this is a chat, any user can chat with a companion 
        const companion = await prismadb.companion.update({
            where: {
                id: params.chatId,
            },
            data: {
                messages: {
                    create: {
                        content: prompt,
                        role: "user",
                        userId: user.id
                    }
                }
            }
        })

        if(!companion) {
            return new NextResponse("AI Buddy not found", { status: 404 }) //429 means too many messages
        }

        const name = companion.name;
        const companion_file_name = name + ".txt"
        
        const companionKey = {
            companionName: companion.id,
            userId: user.id,
            modelName: "llama2-13b",
        }

        const memoryManager = await MemoryManager.getInstance();

        const records = await memoryManager.readLatestHistory(companionKey);

        if (records.length === 0) {
            await memoryManager.seedChatHistory(companion.seed, "\n\n", companionKey);
        }

        await memoryManager.writeToHistory("User: " + prompt + "\n", companionKey);

        const recentChatHistory = await memoryManager.readLatestHistory(companionKey);

        const similarDocs = await memoryManager.vectorSearch(
            recentChatHistory,
            companion_file_name
        );

        let relevantHistory = "";

        if (!!similarDocs && similarDocs.length !== 0) {
            relevantHistory = similarDocs.map((doc) => doc.pageContent).join("\n");
        }

        const { handlers } = LangChainStream();

        const model = new Replicate({
            model: "meta/llama-2-13b-chat:f4e2de70d66816a838a89eeeb621910adffb0dd0baba3976c96980970978018d",
            input: {
                max_length: 2048
            },
            apiKey: process.env.REPLICATE_API_TOKEN,
            callbackManager: CallbackManager.fromHandlers(handlers),
        });

        model.verbose = true;

        const resp = String(
            await model
                .call(
                    `ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${name}: prefix
                    ${companion.instructions}

                    Below are the relevant details about ${name}'s past and the conversation you are in.
                    ${relevantHistory}

                    ${recentChatHistory}\n${name}:
                    `
                )
                .catch(console.error)
        )

        const cleaned = resp.replaceAll(",", ""); //Model response has a lot of commas
        const chunks = cleaned.split("\n\n\n");
        const response = chunks[0];

        // console.log("RESP:", resp)
        // console.log("CLEANED:", cleaned)
        // console.log("CHUNKS:", chunks)
        // console.log("RESPONSE:", response)

        // write response to memory manager
        await memoryManager.writeToHistory("" + response.trim(), companionKey);

        // Setting up a readable stream
        var Readable = require("stream").Readable;

        let s = new Readable();
        s.push(response);
        s.push(null);

        // If there is a valid response from AI
        if (response !== undefined && response.length > 1) {
            memoryManager.writeToHistory("" + response.trim(), companionKey)

            await prismadb.companion.update({
                where: {
                    id: params.chatId,
                },
                data: {
                    messages: {
                        create: {
                            content: response.trim(),
                            role: "system",
                            userId: user.id
                        }
                    }
                }
            })
        }

        return new StreamingTextResponse(s);

    } catch (error) {
        console.log("{CHAT_POST]", error)
        return new NextResponse("Internal error", { status: 500 })
    }
}