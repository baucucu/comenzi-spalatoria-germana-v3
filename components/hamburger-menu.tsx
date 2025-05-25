import { signOutAction } from "@/app/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function HamburgerMenu() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open menu">
                    <Menu className="h-6 w-6" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {/* Placeholder for future nav links */}
                {/* <DropdownMenuItem asChild>
                    <Link href="/some-page">Some Page</Link>
                </DropdownMenuItem> */}
                {!hasEnvVars ? (
                    <DropdownMenuItem asChild>
                        <Button asChild size="sm" variant="outline" disabled className="opacity-75 cursor-none pointer-events-none w-full justify-start">
                            <Link href="/sign-in">Sign in</Link>
                        </Button>
                    </DropdownMenuItem>
                ) : user ? (
                    <form action={signOutAction}>
                        <DropdownMenuItem asChild>
                            <Button type="submit" variant="ghost" className="w-full justify-start">
                                Sign out
                            </Button>
                        </DropdownMenuItem>
                    </form>
                ) : (
                    <DropdownMenuItem asChild>
                        <Button asChild size="sm" variant="outline" className="w-full justify-start">
                            <Link href="/sign-in">Sign in</Link>
                        </Button>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 