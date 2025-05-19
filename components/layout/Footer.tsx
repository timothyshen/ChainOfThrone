"use client"
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Home, Gamepad2, User } from "lucide-react";
import { usePathname } from "next/navigation";

function Footer() {
    const currentYear = new Date().getFullYear();
    const pathname = usePathname();

    // Check if the current route is active
    const isActive = (path: string) => {
        return pathname === path || pathname?.startsWith(path + '/');
    };

    return (
        <>
            {/* Desktop Footer - hidden on mobile */}
            <footer className={cn("bg-primary text-primary-foreground py-6 mt-auto hidden md:block")}>
                <div className={cn("container mx-auto px-4")}>
                    <div className={cn("flex flex-col md:flex-row justify-between items-center")}>
                        <div className={cn("mb-4 md:mb-0")}>
                            <p>&copy; {currentYear} Chain of Throne. All rights reserved.</p>
                        </div>
                        <div className={cn("flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4")}>
                            <p className={cn("text-sm")}>Powered by AI Slave</p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Mobile Navigation Bar - visible only on mobile */}
            <div className={cn(
                "fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground py-2 md:hidden",
                "border-t border-primary-foreground/20 z-50"
            )}>
                <div className="flex justify-around items-center">
                    <Link href="/" className={cn(
                        "flex flex-col items-center px-4 py-1 rounded-md transition-colors",
                        isActive('/') ? "text-white bg-primary-foreground/20" : "text-primary-foreground/70 hover:bg-primary-foreground/10"
                    )}>
                        <Home size={24} />
                        <span className="text-xs mt-1">Home</span>
                    </Link>

                    <Link href="/explore" className={cn(
                        "flex flex-col items-center px-4 py-1 rounded-md transition-colors",
                        isActive('/explore') || isActive('/game') ? "text-white bg-primary-foreground/20" : "text-primary-foreground/70 hover:bg-primary-foreground/10"
                    )}>
                        <Gamepad2 size={24} />
                        <span className="text-xs mt-1">Games</span>
                    </Link>

                    <Link href="/profile" className={cn(
                        "flex flex-col items-center px-4 py-1 rounded-md transition-colors",
                        isActive('/') ? "text-white bg-primary-foreground/20" : "text-primary-foreground/70 hover:bg-primary-foreground/10"
                    )}>
                        <User size={24} />
                        <span className="text-xs mt-1">Profile</span>
                    </Link>
                </div>
            </div>

            {/* Add padding at bottom of page to account for fixed mobile nav */}
            <div className="h-16 md:hidden"></div>
        </>
    );
}

export default Footer; 