"use client"
import Link from "next/link";
import { Home, User, Map } from "lucide-react";
import { useParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";



function GameFooter() {

    const pathname = usePathname();
    const { address } = useParams();
    return (
        <>
            {/* Mobile Navigation Bar - visible only on mobile */}
            <div className={cn(
                "fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground py-2 md:hidden",
                "border-t border-primary-foreground/20 z-50"
            )}>
                <div className="flex justify-around items-center">
                    <Link href={`/explore`} className={cn(
                        "flex flex-col items-center px-4 py-1 rounded-md transition-colors",
                        pathname === '/explore' ? "text-white bg-primary-foreground/20" : "text-primary-foreground/70 hover:bg-primary-foreground/10"
                    )}>
                        <Home size={24} />
                        <span className="text-xs mt-1">Explore</span>
                    </Link>

                    <Link href={`/game/${address}`} className={cn(
                        "flex flex-col items-center px-4 py-1 rounded-md transition-colors",
                        pathname === `/game/${address}` ? "text-white bg-primary-foreground/20" : "text-primary-foreground/70 hover:bg-primary-foreground/10"
                    )}>
                        <Map size={24} />
                        <span className="text-xs mt-1">Map</span>
                    </Link>

                    <Link href={`/game/${address}/profile`} className={cn(
                        "flex flex-col items-center px-4 py-1 rounded-md transition-colors",
                        pathname === `/game/${address}/profile` ? "text-white bg-primary-foreground/20" : "text-primary-foreground/70 hover:bg-primary-foreground/10"
                    )}>
                        <User size={24} />
                        <span className="text-xs mt-1">Profile</span>
                    </Link>
                </div>
            </div>

            {/* Add padding at bottom of page to account for fixed mobile nav */}
            <div className="h-16 md:hidden"></div>
        </>
    )
}

export default GameFooter;