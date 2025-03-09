'use client'

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGameCreate } from '@/lib/hooks/useGameCreate'
import { useToast } from "@/lib/hooks/use-toast"
import { Spinner } from "../ui/spinner"

const CreateNewGame = () => {
    const { createGame, isPending, isConfirming, error, isConfirmed } = useGameCreate()
    const { toast } = useToast()

    const handleCreateGame = async () => {
        try {
            toast({
                title: "Creating Game",
                description: (
                    <div className="flex items-center">
                        <Spinner className="mr-2" />
                        Preparing for battle...
                    </div>
                ),
            })

            await createGame()

            if (isConfirmed) {
                toast({
                    title: 'Game Created',
                    description: (
                        <div>
                            <p>Game created successfully!</p>
                            <p>Game ID: tx</p>
                            <Button>Join Game</Button>
                        </div>
                    ),
                    variant: 'default',
                })
            }
        } catch (err) {
            toast({
                title: 'Error',
                description: error?.message,
                variant: 'destructive',
            })
        }
    }

    return (
        <Button
            className="w-full hover:bg-gray-200 font-semibold h-12 text-lg"
            onClick={handleCreateGame}
            disabled={isPending}
        >
            <Plus className="mr-2 h-4 w-4 font-extrabold" />
            {isPending ? 'Creating...' : 'Create New Battle'}
        </Button>
    )
}

export default CreateNewGame