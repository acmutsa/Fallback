"use client";

import { Plus, ChevronRight, ArrowRight, UserPlus } from "lucide-react";

import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
} from "@/components/ui/sidebar";

import { Link } from "@tanstack/react-router";
import { Suspense } from "react";
import NavTeamsList from "./nav-teams-list";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

export function NavTeams() {
	return (
		<SidebarGroup className="group-data-[collapsible=icon]:hidden">
			<SidebarGroupLabel>Teams</SidebarGroupLabel>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton asChild>
						<Link to="/team/new">
							<Plus />
							<span>Create Team</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>
				<Collapsible asChild className="group/collapsible">
					<SidebarMenuItem>
						<CollapsibleTrigger asChild>
							{/* tooltip={item.title} */}
							<SidebarMenuButton>
								<UserPlus />
								<span>Join a team</span>
								<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
							</SidebarMenuButton>
							{/* <SidebarMenuItem>
							</SidebarMenuItem> */}
						</CollapsibleTrigger>
						<CollapsibleContent>
							<NavTeamsJoin />
						</CollapsibleContent>
					</SidebarMenuItem>
				</Collapsible>
				{/* This part will fetch our teams so we will need to wrap this in suspense later */}
				<Suspense
					fallback={<p>Loading Teams (come back and make )...</p>}
				>
					<NavTeamsList />
				</Suspense>
			</SidebarMenu>
		</SidebarGroup>
	);
}

function NavTeamsJoin() {
	const [inv, setInv] = useState<string | undefined>(undefined);
	const [teamId, setTeamId] = useState<string | undefined>(undefined);
	const navigate = useNavigate();

	return (
		<SidebarMenuSub className="flex flex-col items-center justify-center">
			<div className="flex flex-row items-center">
				<Label>By Invite code</Label>
				<Input
					className="border-r-0"
					value={inv}
					onChange={(e) => setInv(e.target.value)}
				/>
				<Button
					disabled={!inv}
					onClick={() => {
						navigate({
							to: "/team/join",
							params: {
								inv,
							},
						});
					}}
				>
					<ArrowRight />
				</Button>
			</div>
			or
			<div className="flex flex-row items-center">
				<Label>By Team Id</Label>
				<Input
					value={teamId}
					onChange={(input) => {
						setTeamId(input.target.value);
					}}
					className="border-r-0"
				/>
				<Button
					disabled={!teamId}
					onClick={() => {
						navigate({
							to: "/team/join",
							params: {
								teamId,
							},
						});
					}}
				>
					<ArrowRight />
				</Button>
			</div>
		</SidebarMenuSub>
	);
}
