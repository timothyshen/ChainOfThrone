'use client'

import { useEffect, useRef } from 'react'
import { useToast } from '@/lib/hooks/use-toast'
import type { TxState, TxToastMessages } from '@/lib/types/transaction'

/**
 * Automatically display Transaction Toast notifications
 *
 * Listens to transaction state changes and automatically displays corresponding toasts
 *
 * Usage:
 * ```tsx
 * const tx = useTransaction()
 * useTransactionToast(tx.state, {
 *   success: 'Army moved successfully!',
 *   error: 'Failed to move army'
 * })
 * ```
 */
export function useTransactionToast(
  state: TxState,
  messages?: TxToastMessages
) {
  const { toast } = useToast()
  const prevStatusRef = useRef<TxState['status']>('idle')

  useEffect(() => {
    // Only trigger on status change to avoid duplicate toasts
    if (prevStatusRef.current === state.status) return
    prevStatusRef.current = state.status

    if (state.status === 'submitted') {
      toast({
        title: 'Transaction Submitted',
        description: messages?.submitted || 'Waiting for blockchain confirmation...',
      })
    }

    if (state.status === 'success') {
      toast({
        title: '✓ Success',
        description: messages?.success || 'Transaction confirmed successfully!',
        variant: 'default',
      })
    }

    if (state.status === 'error') {
      const errorMessage = 'error' in state ? state.error.message : 'Transaction failed'
      toast({
        title: 'Failed',
        description: messages?.error || errorMessage,
        variant: 'destructive',
      })
    }
  }, [state, toast, messages])
}
