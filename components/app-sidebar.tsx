import { Calendar, Home, Inbox, Search, Settings, LogOut } from "lucide-react"

import {
    Sidebar,
    SidebarHeader,
    SidebarFooter,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { ThemeSwitcher } from "@/components/theme-switcher"
import Logo from "@/components/logo"
import { signOutAction } from "@/app/actions"

// Menu items.
const items = [
    {
        title: "Home",
        url: "#",
        icon: Home,
    },
    {
        title: "Inbox",
        url: "#",
        icon: Inbox,
    },
    {
        title: "Calendar",
        url: "#",
        icon: Calendar,
    },
    {
        title: "Search",
        url: "#",
        icon: Search,
    },
    {
        title: "Settings",
        url: "#",
        icon: Settings,
    },
]

export function AppSidebar({ children }: { children?: React.ReactNode }) {
    return (
        <Sidebar>
            <SidebarHeader className="flex border-b">
                <Link href="/">
                    <Logo />
                </Link>
            </SidebarHeader>
            <SidebarContent className="flex flex-col justify-between">
                <SidebarGroup>
                    {/* <SidebarGroupLabel>Application</SidebarGroupLabel> */}
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenuItem className="list-none">
                            <form action={signOutAction}>
                                <SidebarMenuButton type="submit">
                                    <LogOut />
                                    <span>Logout</span>
                                </SidebarMenuButton>
                            </form>
                        </SidebarMenuItem>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            {/* {children} */}
            <SidebarFooter className="w-full flex  flex-row justify-between items-center text-xs border-t">

                <p className="m-0">
                    Powered by{" "}
                    <a
                        href="https://appy.agency.com/?utm_source=spalatoria-germana&utm_medium=comenzi-app&utm_term=footer-link"
                        target="_blank"
                        className="font-bold hover:underline inline-block py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                        rel="noreferrer"
                    >
                        appy.agency
                    </a>
                </p>
                <ThemeSwitcher />

            </SidebarFooter >
        </Sidebar >
    )
}
