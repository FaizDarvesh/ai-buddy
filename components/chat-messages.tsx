"use client";

import { Companion, Message } from "@prisma/client";
import { ChatMessage, ChatMessageProps } from "./chat-message";
import { ElementRef, useEffect, useRef, useState } from "react";

interface ChatMessagesProps {
    messages: ChatMessageProps[];
    companion: Companion;
    isLoading: boolean;
}

const ChatMessages = ( {companion, isLoading, messages = []} : ChatMessagesProps) => {

    // Scroll the user to the bottom - most recent messages
    const scrollRef = useRef<ElementRef<"div">>(null);
    
    const [fakeLoading, setFakeLoading] = useState(messages.length === 0 ? true : false); //fake load the first message to show typing effect, not for multiple messages

    useEffect(() => {
        const timeout = setTimeout(() => {
            setFakeLoading(false);
        }, 1000); //after 1 second, set fakeloading to false so the fake load stops

        return () => {
            clearTimeout(timeout);
        }
    }, []);

    useEffect(() => {
        scrollRef?.current?.scrollIntoView({behavior: "smooth"});
    }, [messages.length])

    return (
        
        
        <div className="flex-1 overflow-y-auto pr-4">
            {/* The element with flex: 1 will be given the remaining full space after the width of all other elements will be the same as their content 
                Overflow is to allow scrolling, Padding is to separate the scroll bar */}
            <ChatMessage 
                isLoading={fakeLoading}
                src={companion.src} 
                role="system" 
                content={`Hello, I am ${companion.name}, ${companion.description}`} 
            />
            { messages.map((message) => (
                <ChatMessage 
                    key={message.content}
                    role={message.role} 
                    src={companion.src} 
                    content={message.content} 
                />
            ))}
            {/* If message is being generated through the API, show the loading animation */}
            {
                isLoading && (
                    <ChatMessage 
                        role="system"
                        src={companion.src}
                        isLoading
                    />
            )}
            <div ref={scrollRef} /> 
            {/* Self closing ref div for scrolling to the most recent message */}

        </div>
    )
}

export default ChatMessages;