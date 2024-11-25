'use client'

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useGameCreate } from '@/lib/hooks/useGameCreate'
import { useToast } from "@/hooks/use-toast"

function CreateNewGame() {
    const { createGame, isPending, error, isConfirming, isConfirmed } = useGameCreate()

    const handleCreateGame = async () => {
        await createGame()

        if (isConfirmed) {
            toast({
                title: 'Game Created',
                description: 'Game created successfully!',
                variant: 'default',
            })
        }

        if (error) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            })
        }
    }

    return (

        <Button className="mb-4 p-2 w-full font-bold" onClick={handleCreateGame} disabled={isConfirming}>
            {isConfirming ? 'Creating Game...' : (<><Plus className="mr-2 h-4 w-4 font-extrabold" />Create New Game</>)}
        </Button>
    )

}

export default CreateNewGame;