"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

interface SubscriptionButtonProps {
    isSuper: boolean
}

export const SubscriptionButton = ({isSuper}: SubscriptionButtonProps) => {
    
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    
    const onClick = async () => {
        try {
            setLoading(true);
            
            const response = await axios.get("/api/stripe"); //Make a request to API path which returns the stripe session URL
            window.location.href = response.data.url //Load the Stripe session URL in the browser

        } catch (error) {
            toast({
                variant: "destructive",
                description: "Something went wrong."
            })
        } finally {
            setLoading(false)
        }
    }
  
    return (
        <Button disabled={loading} onClick={onClick} size="sm" variant={isSuper ? "default" : "premium"} >
            { isSuper ? "Manage Subscription" : "Upgrade"}
            { !isSuper && <Sparkles className="h-4 w-4 ml-2 fill-white"/>}
        </Button>
    )
}
