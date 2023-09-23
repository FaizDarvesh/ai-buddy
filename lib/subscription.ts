import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";

const DAY_IN_MS = 86_400_000;

export const checkSubscription = async () => {
    const { userId } = auth();

    if(!userId) {
        return false;
    }

    const userSubscription = await prismadb.userSubscription.findUnique({
        where: {
            userId: userId
        },
        select: { //Select which fields to fetch as a part of this query
            stripeCurrentPeriodEnd: true,
            stripeCustomerId: true,
            stripePriceId: true,
            stripeSubscriptionId: true,
        }
    });

    if (!userSubscription) {
        // This means user has never subscribed so there is no record for the user ID
        return false
    }

    const isValid = (
        userSubscription.stripePriceId && 
        userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now()
    )
    // Using the ! non-null assertion operator, we can tell TypeScript we are certain the variable - stripecurrentperiodEnd - will never be null (or undefined), so it can confidently apply functions to it

    return !!isValid;
    //  A double exclamation '!!' ensures value is always of type boolean. A single exclamation reverses the value.
}