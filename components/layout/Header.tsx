"use client"
import Link from "next/link"
import LoginButton from "@/components/home/LoginButton"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { useFarcasterActions } from "@/lib/hooks/useFarcasterActions"

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { openUrl } = useFarcasterActions();

    return (
        <header className={cn("bg-primary text-primary-foreground py-4")}>
            <div className={cn("container mx-auto px-4 flex justify-between items-center")}>
                <div className={cn("flex items-center")}>
                    <Link href="/" className={cn("text-2xl font-bold")}>
                        Chain of Throne
                    </Link>
                    {/* Desktop Navigation */}
                    <nav className={cn("hidden md:block ml-6")}>
                        <ul className={cn("flex space-x-4")}>
                            <li><Link href="/explore" className={cn("hover:underline")}>Explore</Link></li>
                            <li><Link href="/about" className={cn("hover:underline")}>About</Link></li>
                            <li>
                                <button
                                    onClick={() => openUrl("https://github.com/timothyshen/ChainOfThrone")}
                                    className={cn("hover:underline")}
                                >
                                    Contact
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>

                <div className="flex items-center">
                    <div className="hidden md:block">
                        <LoginButton />
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden ml-4"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <X size={24} className="text-primary-foreground" />
                        ) : (
                            <Menu size={24} className="text-primary-foreground" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-primary border-t border-primary-foreground/10 py-4 z-10">
                    <div className="container mx-auto px-4">
                        <nav className="flex flex-col space-y-4">
                            <Link href="/explore" className="hover:underline">Explore</Link>
                            <Link href="/about" className="hover:underline">About</Link>
                            <button
                                onClick={() => openUrl("https://github.com/timothyshen/ChainOfThrone")}
                                className="hover:underline text-left"
                            >
                                Contact
                            </button>
                            <div className="pt-2">
                                <LoginButton />
                            </div>
                        </nav>
                    </div>
                </div>
            )}
        </header>
    )
}

export default Header 