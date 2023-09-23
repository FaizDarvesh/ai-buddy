"use client";

import { usePathname, useRouter } from "next/navigation"
import { Home, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProModal } from "@/hooks/use-pro-modal";

interface SidebarPro {
    isSuper: boolean
}

const Sidebar = ({isSuper}: SidebarPro) => {
  
    const pathname = usePathname();
    const router = useRouter();
    
    const proModal = useProModal();
    
    const routes = [
        {
            icon: Home,
            href: "/",
            label: "Home",
            pro: false, //checks if a route should be protected
        },
        {
            icon: Plus,
            href: "/companion/new",
            label: "New",
            pro: true, //checks if a route should be protected
        },
        {
            icon: Settings,
            href: "/settings",
            label: "Settings",
            pro: false, //checks if a route should be protected
        },
    ];

    const onNavigate = (url: string, pro: boolean) => {
        if (pro && !isSuper) {
            return proModal.onOpen();
        }

        return router.push(url);
    }
  
    return (
    <div className="space-y-4 flex flex-col h-full bg-secondary text-primary">
        <div className="p-3 flex flex-1 justify-center">
            <div className="space-y-2">
                { routes.map((route) => (
                    <div
                        onClick={() => onNavigate(route.href, route.pro)} //Check if route requires user to be pro and navigate
                        key={route.href} className={cn(
                        "text-muted-foreground text-xs group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                        pathname === route.href && "bg-primary/10 text-primary"
                    )}>
                        <div className="flex flex-col gap-y-2 items-center flex-1">
                            <route.icon className="h-5 w-5" />
                            {route.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  )
}

export default Sidebar;