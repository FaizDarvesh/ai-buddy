"use client";

import { Menu, Sparkles } from "lucide-react";
import { Poppins } from "next/font/google";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { cn } from "@/lib/utils";
import MobileSidebar from "@/components/mobile-sidebar";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useProModal } from "@/hooks/use-pro-modal";

const font = Poppins({
    weight: "700",
    subsets: ["latin"],
})

interface NavbarProps {
    isSuper: boolean,
}


export const Navbar = ({ isSuper }: NavbarProps) => {
  
    const proModal = useProModal(); 
  
    return (
        <div className="fixed w-full h-16 z-50 flex justify-between items-center py-2 px-4 border-b border-primary/10 bg-secondary">
            <div className="flex items-center">
                <MobileSidebar isSuper={isSuper} />
                <Link href="/">
                    <h1 className={cn("hidden md:block text-xl md:text-3xl font-bold text-primary", font.className)}>
                        buddy.ai
                    </h1>
                </Link>
            </div>
            <div className="flex items-center gap-x-3">
                    {/* Only show the button if not pro user. Checking isPro in checkSubscription */}
                    {!isSuper && (
                    <Button onClick={proModal.onOpen} variant="premium" size="sm">
                        Upgrade
                        <Sparkles className="h-3 w-3 fill-white text-white ml-2" />
                    </Button>
                    )}
                    <ModeToggle />
                    <UserButton afterSignOutUrl="/" />
                {/* After sign out URL redirects the user to this page instead of a different URL for Clerk */}
            </div>
        </div>
    )
}

// cn library allows dynamic classnames in Tailwind