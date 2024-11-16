import HowToPlayButton from "@/components/home/HowToPlayButton"
import LoginButton from "@/components/home/LoginButton";

export default function HomePage() {

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <main className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-primary">Welcome to Diplomacy</h1>
        <p className="text-xl mb-8 text-muted-foreground">Experience the art of negotiation and strategy</p>

        <div className="space-x-4">
          <HowToPlayButton />
          <LoginButton />
        </div>
      </main>
    </div>
  )
}