// This is put in components folder as a separate item as this avatar will also be used for the chat body

import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarImage } from "@/components/ui/avatar"

// No props needed

const UserAvatar = () => {
  
  const { user } = useUser();
  
  return (
    <Avatar className="h-12 w-12">
        <AvatarImage src={user?.imageUrl} />
    </Avatar>
  )
}

export default UserAvatar;