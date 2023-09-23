import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
    apiVersion: "2023-08-16", //tooltip for apiVersion in VS Code says this is the value
    typescript: true,
})