'use client'

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGameCreate } from '@/lib/hooks/useGameCreate'
import { useToast } from "@/lib/hooks/use-toast"
import { Spinner } from "../ui/spinner"

const CreateNewGame = () => {
    const { createGame, isPending, isConfirming, error, isConfirmed } = useGameCreate()
    const [isCreateGameOpen, setIsCreateGameOpen] = useState<boolean>(false)
    const { toast } = useToast()

    if (isConfirming) {
        toast({
            title: "Joining Game",
            description: <div className="flex items-center">
                <Spinner className="mr-2" />
                Preparing for battle...
            </div>,
            duration: 3000,
        })
    }


    const handleCreateGame = async () => {
        try {
            await createGame()


            if (isPending) {
                toast({
                    title: 'Creating Game',
                    description: 'Game is being created',
                    variant: 'default',
                })
            }

            if (isConfirmed) {
                toast({
                    title: 'Game Created',
                    description: 'Game created successfully!',
                    variant: 'default',
                })
                setIsCreateGameOpen(false)
            }
        } catch (err) {
            toast({
                title: 'Error',
                description: error?.message || 'Failed to create game',
                variant: 'destructive',
            })
        }
    }

    return (
        <>
            <Button
                className="w-full hover:bg-gray-200 font-semibold h-12 text-lg"
                onClick={() => handleCreateGame()}
                disabled={isPending}
            >
                <Plus className="mr-2 h-4 w-4 font-extrabold" />
                {isPending ? 'Creating...' : 'Create New Battle'}
            </Button>
        </>
    )
}

export default CreateNewGame