'use client'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useGameCreate } from '@/lib/hooks/useGameCreate'
import { useToast } from "@/lib/hooks/use-toast"
import { CreateGameModal } from "./GameSetup"

function CreateNewGame() {
    const { createGame, isPending, error, isConfirming, isConfirmed } = useGameCreate()
    const [isCreateGameOpen, setIsCreateGameOpen] = useState(false)

    const { toast } = useToast();
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
        <>
            <Button
                className="w-full hover:bg-gray-200  font-semibold h-12 text-lg"
                onClick={() => handleCreateGame()}
            >
                <Plus className="mr-2 h-4 w-4 font-extrabold" />Create New Battle
            </Button>
            {/* <CreateGameModal isOpen={isCreateGameOpen} onClose={() => setIsCreateGameOpen(false)} /> */}
        </>
    )

}

export default CreateNewGame;