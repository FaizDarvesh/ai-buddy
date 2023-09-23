import prismadb from "@/lib/prismadb";
import { CompanionForm } from "./components/companion-form";
import { auth, redirectToSignIn } from "@clerk/nextjs";

interface CompanionIdPageProps {
    params: {
        companionId: string;
    };
};

const CompanionIdPage = async ({params}: CompanionIdPageProps) => {
  
    const { userId } = auth();
    
    // TO-DO: Check subscription
  
    if(!userId) {
        return redirectToSignIn();
    }

    const companion = await prismadb.companion.findUnique({
        where: {
            userId, //only the user who set up the character can edit it
            id: params.companionId //on clicking new link in sidebar, user is routed to companion/new so id is always going to be new. But for companion / companion ID will fetch the record as initial data
        }
    });

    const categories = await prismadb.category.findMany();
  
    return ( 
    <CompanionForm 
        initialData={companion}
        categories={categories}
    />
  )
}

export default CompanionIdPage;