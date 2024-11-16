import { Button } from "@/components/ui/button"
import HowToPlayButton from "@/components/home/HowToPlayButton"
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

export default function HomePage() {

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <main className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-primary">Welcome to Diplomacy</h1>
        <p className="text-xl mb-8 text-muted-foreground">Experience the art of negotiation and strategy</p>

        <div className="space-x-4">
          <HowToPlayButton />
          <DynamicWidget innerButtonComponent={
            <Button variant="secondary" size="sm">Connect</Button>
          } />
        </div>
      </main>
    </div>
  )
}