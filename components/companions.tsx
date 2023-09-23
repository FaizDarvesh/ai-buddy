"use client";

import { Companion } from "@prisma/client";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { MessagesSquare } from "lucide-react";

interface CompanionProps {
    data: (Companion & { _count: { messages: number, } })[];
}

export const Companions = ({ data }: CompanionProps) => {
  
    if(data.length === 0) {
        return (
            <div className="pt-10 flex flex-col items-center justify-center space-y-3">
                <div className="relative w-60 h-60">
                    <Image 
                        fill
                        className="grayscale"
                        alt="Empty"
                        src="/undraw_emptyList.svg"
                    />
                </div>
                <div className="text-sm text-muted-foregroun">
                    No companions found.
                </div>
            </div>
        )
    }

    return (
        <div className=" grid grid-col-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 pb-10">
            
            {/* Map each component and count, and display as a card */}
            {data.map((item) => (
                <Card key={item.id} className="bg-primary/5 rounded-lg border-0 hover:opacity-75 cursor-pointer transition">
                    <Link href={`/chat/${item.id}`}>
                        {/* Square brackets show up as ID in URL, paranthesis does not impact the route URL */}
                        <CardHeader className="flex items-center justify-center text-center text-muted-foreground">
                            <div className="relative w-32 h-32">
                                <Image 
                                    src={item.src}
                                    fill
                                    className="rounded-xl object-cover"
                                    alt={item.name}
                                />
                            </div>
                            <p className="font-bold pt-4">{item.name}</p>
                            <p className="text-xs">{item.description}</p>
                        </CardHeader>
                    </Link>
                    <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
                        <p className="lowercase">@{item.userName}</p>
                        <div className="flex">
                            {/* Message icon from lucide-react */}
                            <MessagesSquare className="w-3 h-3 mr-2" />
                            {item._count.messages}
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}