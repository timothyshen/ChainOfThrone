'use client'

import { Plus } from "lucide-react"
import { useGameCreate } from '@/lib/hooks/useGameCreate'
import { useTransaction } from "@/lib/hooks/useTransaction"
import { useTransactionToast } from "@/lib/hooks/useTransactionToast"
import { TransactionButton } from "@/components/shared/TransactionButton"

const CreateNewGame = () => {
    const { createGame } = useGameCreate()
    const tx = useTransaction()

    // 自动显示交易状态通知
    useTransactionToast(tx.state, {
        success: "Game created successfully!",
        error: "Failed to create game"
    })

    const handleCreateGame = async () => {
        await tx.execute(() => createGame())
    }

    return (
        <TransactionButton
            state={tx.state}
            onClick={handleCreateGame}
            idleText={
                <div className="flex items-center">
                    <Plus className="mr-2 h-4 w-4 font-extrabold" />
                    Create New Battle
                </div>
            }
            preparingText="Preparing..."
            signingText="Sign in Wallet"
            submittedText="Creating..."
            confirmingText="Confirming..."
            successText="✓ Created!"
            errorText="Try Again"
            className="w-full hover:bg-gray-200 font-semibold h-12 text-lg"
        />
    )
}

export default CreateNewGame