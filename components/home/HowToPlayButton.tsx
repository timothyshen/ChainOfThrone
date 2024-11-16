'use client'

import { useState } from "react"
import {
    Dialog,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import HowToPlay from "@/components/home/HowToPlay"

export default function HowToPlayButton() {
    const [isRulesOpen, setIsRulesOpen] = useState(false)

    return (
        <Dialog open={isRulesOpen} onOpenChange={setIsRulesOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">How to Play</Button>
            </DialogTrigger>
            <HowToPlay />
        </Dialog>
    )
}