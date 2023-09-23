"use client";

import { useToast } from "@/components/ui/use-toast";
import { BeatLoader } from "react-spinners";

import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import BotAvatar from "@/components/bot-avatar";
import UserAvatar from "@/components/user-avatar";
import { Button } from "./ui/button";
import { Copy } from "lucide-react";

export interface ChatMessageProps {
    role: "system" | "user",
    content?: string,
    isLoading?: boolean;
    src?: string; //Image to show in Avatar
}   
// export as this is to be used as a message type definer in the client tsx file to ensure message format is followed.
// ? after a key means is the optional chaining operator - it provides a way to simplify accessing values through connected objects when it's possible that a reference or function may be undefined or null

export const ChatMessage = ( {role, content, isLoading, src} : ChatMessageProps ) => {
  
    const { toast } = useToast();
    const { theme } = useTheme();

    const onCopy = () => {
        if(!content) {
            return;
        }

        navigator.clipboard.writeText(content);
        toast({
            description: "copied to Clipboard!"
        })
    }
    
    return (
        <div className={cn("group flex items-start gap-x-3 py-4 w-full", role === "user" ? "justify-end" : "")}>
            { role !== "user" && src && <BotAvatar src={src} /> }
            <div className="rounded-md px-4 py-2 max-w-sm text-sm bg-primary/10">
                { isLoading ? <BeatLoader size={4} color={theme === "light" ? "black" : "white"} /> : content }
            </div>
            { role === "user" && <UserAvatar /> }
            {/* User avatar on the right or after the message unlike the bot avatar */}

            { role !== "user" && !isLoading &&
                <Button 
                    onClick={onCopy}
                    className="opacity-0 group-hover:opacity-100 transition"
                    size="icon"
                    variant="ghost"
                >
                    <Copy className="w-4 h-4" />
                </Button>
            
            }
        </div>
    )
}