"use client";

import { Companion, Message } from "@prisma/client";
import { useRouter } from "next/navigation";
import axios from "axios";

import { ChevronLeft, Edit, MessagesSquare, MoreVertical, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

import BotAvatar from "./bot-avatar";
import { useUser } from "@clerk/nextjs";

interface ChatHeaderProps {
    companion: Companion & {
        messages: Message[];
        _count: {
            messages: number;
        }
    },
    isSuper: boolean
}

const ChatHeader = ( {companion, isSuper} : ChatHeaderProps ) => {
  
    const router = useRouter();
    const { user } = useUser(); //can also use auth to get the current user information as used elsewhere
    const { toast } = useToast();

    const onDelete = async () => {
        try {
            await axios.delete(`/api/companion/${companion.id}`)

            toast({
                description: "success"
            })

            router.refresh();
            router.push("/");

        } catch (error) {
            toast({
                description: "Something went wrong",
                variant: "destructive"
            })
        }
    }
  
    return (
    <div className="flex w-full justify-between items-center border-b border-primary/20 pb-4">
        <div className="flex gap-x-2 items-center">
            <Button onClick={() => router.back()} size="icon" variant="ghost">
                {/* Import 'back' icon from Lucide react */}
                <ChevronLeft className="h-6 w-6" />
            </Button>
            <BotAvatar src={companion.src} />
            <div className="flex flex-col gap-y-1">
                <div className="flex items-center mx-3">
                    <p className="font-bold"> {companion.name} </p>
                    <div className=" mx-3 flex items-center text-xs text-muted-foreground">
                        <MessagesSquare className="w-4 h-4 mx-2"/>
                        {companion._count.messages}
                    </div>
                </div>
                <p className="mx-3 text-xs text-muted-foreground">Ideated by {companion.userName}</p>
            </div>
        </div>
        {/* Check if user's ID is same as companion creating user ID then show dropdown menu */}
        {user?.id === companion.userId && (
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <Button>
                        {/* Icon from Lucide react */}
                        <MoreVertical />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {
                        // Only allow editing if user is an active super subscriber
                        isSuper &&
                        <DropdownMenuItem onClick={ () => router.push(`/companion/${companion.id}`) }>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                    }
                    <DropdownMenuItem onClick={onDelete}>
                        <Trash className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )}
    </div>
  )
}

export default ChatHeader;