import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { getUserQueryClient, getUserTeamsQueryClient } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils";
import { Plus, UserPlus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";

export default function UserButton() {
	const { data: user, isLoading: isFetchingUser } =
		useQuery(getUserQueryClient);

	const {
		data: userTeamsResult,
		isLoading: isFetchingUserTeams,
		isError,
	} = useQuery(getUserTeamsQueryClient);
	const userTeams = userTeamsResult?.message;

	const { invalidate, navigate } = useRouter();

	if (isFetchingUser) {
		return <Skeleton className="w-8 h-8 rounded-full" />;
	}
	if (!user) {
		return null;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild className="cursor-pointer">
				<Avatar>
					<AvatarImage src={user.image || ""} />
					<AvatarFallback className="bg-gradient-to-tr text-white from-slate-200 to-violet-500">
						{getInitials(user.name)}
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="start">
				<DropdownMenuLabel className="text-balance">
					{user.name}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<Link to="/profile">
						<DropdownMenuItem className="cursor-pointer">
							Profile
						</DropdownMenuItem>
					</Link>
					<Link to="/settings">
						<DropdownMenuItem className="cursor-pointer">
							Settings
						</DropdownMenuItem>
					</Link>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							My Teams
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent className="w-44">
								{isFetchingUserTeams ? (
									<UserTeamsLoadingSkeleton />
								) : isError ? (
									<DropdownMenuItem>
										Failed to load teams
									</DropdownMenuItem>
								) : (
									userTeams &&
									userTeams.length > 0 && (
										<>
											{userTeams?.map((userToTeam) => (
												<DropdownMenuItem
													key={userToTeam.team.id}
												>
													<Link
														to={"/team/$teamId"}
														params={{
															teamId: userToTeam
																.team.id,
														}}
														className="underline"
													>
														<span>
															{
																userToTeam.team
																	.name
															}
														</span>
													</Link>
												</DropdownMenuItem>
											))}
											<DropdownMenuSeparator />
										</>
									)
								)}

								<DropdownMenuItem>
									<Plus />
									<Link to="/team/new">Create Team</Link>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<UserPlus />
									<Link to="/team/join">Join a Team</Link>
								</DropdownMenuItem>
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<Link to="/feedback">
						<DropdownMenuItem className="cursor-pointer">
							Feedback
						</DropdownMenuItem>
					</Link>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={async () => {
						toast.loading("Logging out...");
						const res = await authClient.signOut();
						toast.dismiss();
						if (res.error) {
							toast.error("Failed to log out. Please try again.");
							return;
						}
						invalidate();
						navigate({
							to: "/",
						});
					}}
				>
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function UserTeamsLoadingSkeleton() {
	return (
		<div className="flex flex-col gap-2 p-2">
			{Array.from({ length: 3 }).map((_, i) => (
				<Skeleton key={i} className="w-full h-6 rounded-md" />
			))}
		</div>
	);
}
