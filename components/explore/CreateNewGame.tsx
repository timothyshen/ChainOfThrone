'use client'

import { useState } from "react"

import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { GameSetupComponent } from "@/components/explore/GameSetup"


function CreateNewGame() {

    const [isRulesOpen, setIsRulesOpen] = useState(false)


    return (
        <Dialog open={isRulesOpen} onOpenChange={setIsRulesOpen}>
            <DialogTrigger asChild>
                <Button className="mb-6">
                    <Plus className="mr-2 h-4 w-4" /> Create New Game
                </Button>
            </DialogTrigger>
            <GameSetupComponent onGameStart={() => { }} />
        </Dialog>
    )

}

export default CreateNewGame;