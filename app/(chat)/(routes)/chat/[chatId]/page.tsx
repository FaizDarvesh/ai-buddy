import prismadb from "@/lib/prismadb";
import { auth, redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import ChatClient from "./components/client";
import { checkSubscription } from "@/lib/subscription";

{/* Square brackets are for dynamic parts of URL - shows up as ID in URL, paranthesis does not impact the route URL */}

interface ChatIdPageProps {
    params: { //params and not search params used herebecause URL is not querying something unlike in rootpage layout with search component
        chatId: string;
    }
}

const ChatIdPage = async ( {params}: ChatIdPageProps ) => {
  
    const { userId } = auth(); //Fetch user information from auth provider - Clerk
    const isSuper = await checkSubscription(); // can only be called on server components

    if (!userId) {
        return redirectToSignIn(); //Clerk method to reroute user to sign in
    }

    const companion = await prismadb.companion.findUnique({
        where: {
            id: params.chatId
        },
        include: {
            messages: {
                orderBy: {
                    createdAt: "asc" //order messages so that the oldest / earliest messages come first in response
                },
                where: {
                    userId
                }
            },
            _count: {
                select: {
                    messages: true
                }
            }
        },
    });

    if(!companion) {
        return redirect("/");
    };
  
    return (
        <ChatClient companion={companion} isSuper={isSuper} />
    )
}

export default ChatIdPage;