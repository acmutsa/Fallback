import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Link } from "@tanstack/react-router"
import { Folder, Forward, Trash2  } from "lucide-react"
import { getUserTeamsQueryClient } from "@/lib/queries"
import { queryClient } from "@/router"


import { MoreHorizontal } from "lucide-react"
export default async function NavTeamsList(){
  const { isMobile } = useSidebar()
  const userTeamsResult = await queryClient.fetchQuery(getUserTeamsQueryClient);
  const userTeams = userTeamsResult.data;

  console.log(userTeams)
  
  return (
    userTeams.map((team) => (
					<SidebarMenuItem key={team.id}>
						<SidebarMenuButton asChild>
							<Link to={'/team/$teamId'}
              params={{
                teamId:team.id
              }}
              >
								{/* <item.icon /> */}
								<span>{team.name}</span>
							</Link>
						</SidebarMenuButton>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuAction showOnHover>
									<MoreHorizontal />
									<span className="sr-only">More</span>
								</SidebarMenuAction>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-48 rounded-lg"
								side={isMobile ? "bottom" : "right"}
								align={isMobile ? "end" : "start"}
							>
								<DropdownMenuItem>
									<Folder className="text-muted-foreground" />
									<span>View Project</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Forward className="text-muted-foreground" />
									<span>Share Project</span>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<Trash2 className="text-muted-foreground" />
									<span>Delete Project</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				))
  )
}