import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import Sidebar from './sidebar';

interface MobileSidebarPro {
  isSuper: boolean,
}

const MobileSidebar = ({ isSuper }: MobileSidebarPro) => {
  return (
    <Sheet>
        <SheetTrigger className='md:hidden pr-4'>
            <Menu className="block md:hidden" />
        </SheetTrigger>
        <SheetContent side="left" className='p-0 bg-secondary pt-10 w-32'>
            <Sidebar isSuper={isSuper} />
        </SheetContent>
    </Sheet>
  )
}

export default MobileSidebar