import HowToPlayButton from "@/components/home/HowToPlayButton"
import LoginButtonHome from "@/components/home/LoginButtonHome";

export default function HomePage() {

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <main className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
          Chain of Throne
        </h1>
        <p className="text-2xl mb-6 text-muted-foreground font-semibold">
          Where Strategy Meets Blockchain
        </p>
        <p className="text-lg mb-8 text-muted-foreground/90 max-w-xl mx-auto">
          Immerse yourself in an epic PvP experience where negotiation,
          strategy, and blockchain technology converge.
        </p>
        <div className="space-x-4">
          <HowToPlayButton />
          <LoginButtonHome />
        </div>
      </main>
    </div>
  )
}