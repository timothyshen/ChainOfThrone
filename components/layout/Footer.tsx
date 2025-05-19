import { cn } from "@/lib/utils";

function Footer() {
    const currentYear = new Date().getFullYear();
    return (
        <footer className={cn("bg-primary text-primary-foreground py-6 mt-auto")}>
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
    );
}

export default Footer; 