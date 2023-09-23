import { Categories } from "@/components/categories"
import { Companions } from "@/components/companions"
import { SearchInput } from "@/components/search-input"
import prismadb from "@/lib/prismadb"

interface RootPageProps {
  searchParams: {
    categoryId: string,
    name: string,
  } //Search params is a convention for every Next 13 server components
}

const RootPage = async ( {searchParams} : RootPageProps ) => {
  
  const data = await prismadb.companion.findMany({
    where: {
      categoryId: searchParams.categoryId,
      name: {
        search: searchParams.name //fulltextSearch preview feature enabled in prisma schema
      }
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: { //display count of messages for this model in the message array using _count in the same query instead of making a separate query
        select: {
          messages: true
        }
      }
    }
  });

  const categories = await prismadb.category.findMany();
  
  return (
    <div className="h-full p-4 space-y-2">
        <SearchInput />
        <Categories data={categories} />
        <Companions data={data} />
    </div>
  )
}

export default RootPage