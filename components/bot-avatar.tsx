// This is put in components folder as a separate item as this avatar will also be used for the chat body

import { Avatar, AvatarImage } from "@/components/ui/avatar"

interface BotAvatarProps {
    src: string
}

const BotAvatar = ( {src}: BotAvatarProps ) => {
  return (
    <Avatar className="h-12 w-12">
        <AvatarImage src={src} />
    </Avatar>
  )
}

export default BotAvatar;