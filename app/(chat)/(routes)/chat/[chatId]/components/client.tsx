"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { useCompletion } from "ai/react";

import { Companion, Message } from "@prisma/client";

import ChatHeader from "@/components/chat-header";
import ChatForm from "@/components/chat-form";
import ChatMessages from "@/components/chat-messages";
import { ChatMessageProps } from "@/components/chat-message";

interface ChatClientProps {
  companion: Companion & {
    messages: Message[];
    _count: {
      messages: number;
    }
  },
  isSuper: boolean
}

const ChatClient = ( {companion, isSuper}: ChatClientProps ) => {
  
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageProps[]>(companion.messages);

  const { input, isLoading, handleInputChange, handleSubmit, setInput } = useCompletion({
    api: `/api/chat/${companion.id}`,
    onFinish(prompt, completion) {
      const systemMessage: ChatMessageProps = {
        role: "system",
        content: completion,
      };

    setMessages((current) => [...current, systemMessage]); //Add the latest response to the messages state
    setInput("");

    router.refresh(); //Makes a new request to the server, re-fetching data and re-rendering Server components
    }
  });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const userMessage: ChatMessageProps = {
      role: "user",
      content: input,
    }

    setMessages((current) => [...current, userMessage]); //Add user input message to state on submit form input

    handleSubmit(e); //handleSubmit is from the useCompletion imported from ai/react and written above to call AI API
  }
  
  return (
    <div className="flex flex-col h-full p-4 space-y-2">
      <ChatHeader companion={companion} isSuper={isSuper} />
      <ChatMessages companion={companion} isLoading={isLoading} messages={messages} />
      <ChatForm 
        isLoading={isLoading}
        input={input}
        handleInputChange = {handleInputChange}
        onSubmit = {onSubmit}
      />
    </div>
  )
}

export default ChatClient;