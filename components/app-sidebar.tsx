"use client";

import { WashingMachine, Settings, LogOut, Users, Shirt, Percent, Icon } from "lucide-react"

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
    SidebarMenuBadge,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { ThemeSwitcher } from "@/components/theme-switcher"
import Logo from "@/components/logo"
import { signOutAction } from "@/app/actions"
import { useRouter } from "next/navigation"
import { Component } from "react";
// TODO: use router push to navigate to the pages instead of using the Link component

export function AppSidebar({ children }: { children?: React.ReactNode }) {
    const { setOpen, setOpenMobile, isMobile } = useSidebar()
    const router = useRouter()

    // Handler to close sidebar
    function handleMenuItemClick(route: string) {
        setOpenMobile(false)
        router.push(route)
    }
    return (
        <Sidebar>
            <SidebarHeader className="flex border-b">
                <Link href="/">
                    <Logo />
                </Link>
            </SidebarHeader>
            <SidebarContent className="flex flex-col justify-between">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/comenzi" onClick={() => handleMenuItemClick("/comenzi")}>
                                        <WashingMachine />
                                        <span>Comenzi</span>
                                    </Link>
                                </SidebarMenuButton>
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                            <Link href="/comenzi" onClick={() => handleMenuItemClick("/comenzi")}>
                                                <WashingMachine />
                                                <span>Noi</span>
                                                <SidebarMenuBadge>24</SidebarMenuBadge>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                            <Link href="/comenzi">
                                                <WashingMachine />
                                                <span>In lucru</span>
                                                <SidebarMenuBadge>12</SidebarMenuBadge>
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

function ComenziMenuItem({ icon, route, label, badge, color, handleMenuItemClick }: { icon: React.ReactNode, route: string, label: string, badge: number, color: string, handleMenuItemClick: (route: string) => void }) {
    return (
        <SidebarMenuSubItem className={`${color}`}>
            <SidebarMenuSubButton asChild>
                <Link href={route} onClick={() => handleMenuItemClick(route)}>
                    {icon}
                    <span>{label}</span>
                    <SidebarMenuBadge>{badge}</SidebarMenuBadge>
                </Link>
            </SidebarMenuSubButton>
        </SidebarMenuSubItem>
    )
}
