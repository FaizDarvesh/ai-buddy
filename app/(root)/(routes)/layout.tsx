import { Navbar } from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { checkSubscription } from "@/lib/subscription";

const RootLayout = async ({children}: { children: React.ReactNode }) => {
  
  const isSuper = await checkSubscription(); //if subscription is found, user considered Super

  return (
    <div className="h-full">
        <Navbar isSuper={isSuper} />
        <div className="hidden md:flex mt-16 w-20 flex-col fixed inset-y-0">
          <Sidebar isSuper={isSuper} />
        </div>
        <main className="md:pl-20 pt-16 h-full">
            {children}
        </main>
    </div>
  )
}

export default RootLayout;