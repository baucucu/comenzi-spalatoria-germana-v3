import { WashingMachine, Home, Settings, LogOut, Users, Shirt, ShoppingBag, Truck, Percent, List, CheckCircle } from "lucide-react"

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
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { ThemeSwitcher } from "@/components/theme-switcher"
import Logo from "@/components/logo"
import { signOutAction } from "@/app/actions"

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
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/comenzi">
                                        <WashingMachine />
                                        <span>Comenzi</span>
                                    </Link>
                                </SidebarMenuButton>
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                            <Link href="/comenzi">
                                                <WashingMachine />
                                                <span>Noi</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                            <Link href="/comenzi">
                                                <WashingMachine />
                                                <span>In lucru</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/clienti">
                                        <Users />
                                        <span>Clienti</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/servicii">
                                        <Shirt />
                                        <span>Servicii</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/reduceri">
                                        <Percent />
                                        <span>Reduceri</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/status-comenzi">
                                        <Settings />
                                        <span>Status comenzi</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
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
