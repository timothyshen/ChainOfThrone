import Link from "next/link"
import LoginButton from "@/components/home/LoginButton"
import { cn } from "@/lib/utils"

function Header() {
    return (
        <header className={cn("bg-primary text-primary-foreground py-4")}>
            <div className={cn("container mx-auto px-4 flex justify-between items-center")}>
                <div className={cn("flex items-center space-x-6")}>
                    <Link href="/" className={cn("text-2xl font-bold")}>
                        Chain of Throne
                    </Link>
                    <nav>
                        <ul className={cn("flex space-x-4")}>
                            <li><Link href="/explore" className={cn("hover:underline")}>Explore</Link></li>
                            <li><Link href="/about" className={cn("hover:underline")}>About</Link></li>
                            <li><Link href="https://github.com/timothyshen/ChainOfThrone" className={cn("hover:underline")}>Contact</Link></li>
                        </ul>
                    </nav>
                </div>
                <LoginButton />
            </div>
        </header>
    )
}

export default Header 