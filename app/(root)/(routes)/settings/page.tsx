import { SubscriptionButton } from "@/components/subscription-button";
import { checkSubscription } from "@/lib/subscription";

const SettingsPage = async () => {
    const isSuper = await checkSubscription(); // can only call this server side.
  
    return (
    <div className="h-full p-4 space-y-2">
        <h3 className="text-lg font-medium"> Settings </h3>
        <div className="text-muted-foreground text-sm">
            {isSuper ? "You are currently subscribed to Super!" : "You are on a free plan."}
        </div>
        <SubscriptionButton isSuper={isSuper} />
    </div>
  )
}

export default SettingsPage;

