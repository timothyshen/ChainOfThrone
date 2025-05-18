import { cn } from "@/lib/utils";

function Footer() {
    const currentYear = new Date().getFullYear()
    return (
        <footer className={cn("bg-primary text-primary-foreground py-4 mt-8")}>
            <div className={cn("container mx-auto px-4 text-center")}>
                <p>&copy; {currentYear} Chain of Throne. All rights reserved.</p>
                <p className={cn("mt-2 text-sm")}>Powered by AI Slave</p>
            </div>
        </footer>
    )
}

export default Footer 