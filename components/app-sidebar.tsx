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
import { useRouter, usePathname } from "next/navigation"
import { Component, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client"
// TODO: use router push to navigate to the pages instead of using the Link component

// OrderStatus type for sidebar usage
interface OrderStatus {
    id: number
    name: string
    label: string
    color: string
    position: number
    created_at: string
    updated_at: string
    status_final: boolean
}

export function AppSidebar({ children }: { children?: React.ReactNode }) {
    const { setOpen, setOpenMobile, isMobile } = useSidebar()
    const router = useRouter()
    const pathname = usePathname();
    const [statuses, setStatuses] = useState<OrderStatus[]>([])

    useEffect(() => {
        const fetchStatuses = async () => {
            const supabase = createClient();
            const { data, error } = await supabase.from("order_statuses").select("*").order("position")
            if (!error && data) setStatuses(data)
        }
        fetchStatuses()
    }, [])

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
                                <SidebarMenuButton asChild isActive={pathname === "/comenzi"}>
                                    <Link href="/comenzi" onClick={() => handleMenuItemClick("/comenzi")}>
                                        <WashingMachine />
                                        <span>Comenzi</span>
                                    </Link>
                                </SidebarMenuButton>
                                <SidebarMenuSub>
                                    {statuses.map((status) => {
                                        return (
                                            <ComenziMenuItem
                                                key={status.id}
                                                icon={<WashingMachine />}
                                                route={`/comenzi?status=${status.name}`}
                                                label={status.label}
                                                badge={0}
                                                color={status.color}
                                                handleMenuItemClick={handleMenuItemClick}
                                            />
                                        )
                                    })}
                                </SidebarMenuSub>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/clienti"}>
                                    <Link href="/clienti">
                                        <Users />
                                        <span>Clienti</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/servicii"}>
                                    <Link href="/servicii">
                                        <Shirt />
                                        <span>Servicii</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/reduceri"}>
                                    <Link href="/reduceri">
                                        <Percent />
                                        <span>Reduceri</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/status-comenzi"}>
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

function ComenziMenuItem({ icon, route, label, badge, color, handleMenuItemClick }: { icon: React.ReactNode, route: string, label: string, badge?: number, color: string, handleMenuItemClick: (route: string) => void }) {
    return (
        <SidebarMenuSubItem >
            <SidebarMenuSubButton asChild className={color}>
                <Link href={route} onClick={() => handleMenuItemClick(route)}>
                    {icon}
                    <span>{label}</span>
                    {typeof badge === 'number' && <SidebarMenuBadge>{badge}</SidebarMenuBadge>}
                </Link>
            </SidebarMenuSubButton>
        </SidebarMenuSubItem>
    )
}
