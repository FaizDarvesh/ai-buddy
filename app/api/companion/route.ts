import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";
import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const user = await currentUser(); 
        const { src, name, description, instructions, seed, categoryId } = body; //All companion form fields destructured

        if (!user || !user.id || !user.firstName) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if ( !src || !name || !description || !instructions || !seed || !categoryId ) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        // Check for subscription before allowing editing buddies
        const isSuper = await checkSubscription();

        if (!isSuper) {
            return new NextResponse("Super subscription needed", { status: 403 })
        }

        const companion = await prismadb.companion.create({
            data: {
                categoryId, //Another way of writing categoryId: categoryId
                userId: user.id,
                userName: user.firstName,
                src, //src is used in prismaDB schema but source is used in form
                name,
                description,
                instructions,
                seed
            }
        })

        return NextResponse.json(companion);

    } catch (error) {
        console.log("[COMPANION_POST]", error) //add companion post before error to detect what's causing the error message.
        return new NextResponse("Internal Error", { status: 500 });
    }
}