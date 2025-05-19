import HowToPlayButton from "@/components/home/HowToPlayButton"
import LoginButtonHome from "@/components/home/LoginButtonHome";
import { cn } from "@/lib/utils";

export default function HomePage() {

  return (
    <div className={cn("min-h-[calc(100vh-8rem)] bg-background flex flex-col items-center justify-center p-4 sm:p-6 md:p-8")}>
      <main className={cn("text-center max-w-2xl")}>
        <h1 className={cn("text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]")}>
          Chain of Throne
        </h1>
        <p className={cn("text-xl sm:text-2xl mb-4 sm:mb-6 text-muted-foreground font-semibold")}>
          Where Strategy Meets Blockchain
        </p>
        <p className={cn("text-base sm:text-lg mb-6 sm:mb-8 text-muted-foreground/90 max-w-xl mx-auto px-2")}>
          Immerse yourself in an epic PvP experience where negotiation,
          strategy, and blockchain technology converge.
        </p>
        <div className={cn("flex flex-col sm:flex-row justify-center items-center gap-4 sm:space-x-4")}>
          <HowToPlayButton />
          <LoginButtonHome />
        </div>
      </main>
    </div>
  )
}