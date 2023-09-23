import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";
import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params } : { params: { companionId: string } }) {
    try {
        const body = await req.json();
        const user = await currentUser(); 
        const { src, name, description, instructions, seed, categoryId } = body; //All companion form fields destructured

        if (!params.companionId) {
            return new NextResponse("Companion ID is required", { status: 400 });
        }
        
        if (!user || !user.id || !user.firstName) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if ( !src || !name || !description || !instructions || !seed || !categoryId ) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        // Check for subscription
        const isSuper = await checkSubscription();

        if (!isSuper) {
            return new NextResponse("Super subscription needed", { status: 403 })
        }

        const companion = await prismadb.companion.update({
            where: {
                id: params.companionId,
                userId: user.id,
            },
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
        // When to use return new Nextresponse vs just return Nextresponse

    } catch (error) {
        console.log("[COMPANION_PATCH]", error) //add companion post before error to detect what's causing the error message.
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request, { params } : { params: { companionId: string } }) {
    try {
        
        const { userId } = auth(); //Using auth here instead of getUser since only userId is needed unlike patch call above

        if(!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const companion = await prismadb.companion.delete({
            where: {
                userId, //User ID of logged in user needs to match the user ID that created the companion for deleted
                id: params.companionId
            }
        })

        return NextResponse.json(companion);
        
    } catch (error) {
        console.log("[COMPANION_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 });
    }
}