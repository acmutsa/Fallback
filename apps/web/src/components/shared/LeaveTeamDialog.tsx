import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { UserX } from "lucide-react";
import { leaveTeamMutationClient } from "@/lib/queries";
import { useMutation } from "@tanstack/react-query";

export function LeaveTeamDialog({
	teamId,
	teamName,
	isPrivate,
}: {
	teamId: string;
	teamName: string;
	isPrivate: boolean;
	role: string;
	//TODO: Come back here and warn the user that if they are the owner of the team,
	// it will be passed on to the next person or even give them an option to
	// delete the team altogether.
}) {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<DropdownMenuItem variant="destructive">
					<UserX className="text-muted-foreground" />
					<span>Leave Team</span>
				</DropdownMenuItem>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Are you sure you want to leave {teamName}?
					</AlertDialogTitle>
					<AlertDialogDescription>
						{isPrivate
							? "You will be unable to rejoin this team without a new invitation."
							: "You can always rejoin this team later, but data associated with this team will no longer be accessible to you."}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction>Leave Team</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
