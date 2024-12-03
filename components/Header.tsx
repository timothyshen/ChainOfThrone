import Link from "next/link"
import LoginButton from "@/components/home/LoginButton"

function Header() {
    return (
        <header className="bg-primary text-primary-foreground py-4">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <div className="flex items-center space-x-6">
                    <Link href="/" className="text-2xl font-bold">
                        Chain of Throne
                    </Link>
                    <nav>
                        <ul className="flex space-x-4">
                            <li><Link href="/explore" className="hover:underline">Explore</Link></li>
                            <li><Link href="/about" className="hover:underline">About</Link></li>
                            <li><Link href="https://github.com/timothyshen/ChainOfThrone" className="hover:underline">Contact</Link></li>
                        </ul>
                    </nav>
                </div>
                <LoginButton />
            </div>
        </header>
    )
}

export default Header