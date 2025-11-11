'use client'

import { useState, useCallback } from 'react'
import { useConfig } from 'wagmi'
import { waitForTransactionReceipt } from 'wagmi/actions'
import type { TxState, UseTransactionReturn } from '@/lib/types/transaction'

/**
 * Unified Transaction State Management Hook
 *
 * Based on state machine design to eliminate state splitting issues
 *
 * Usage:
 * ```tsx
 * const tx = useTransaction()
 * const { makeMove } = useMakeMove()
 *
 * const handleMove = async () => {
 *   tx.prepare({ armyId: '123' })
 *   await tx.execute(() => makeMove(gameAddress, move))
 *   // Transaction is confirmed here! Safe to execute subsequent logic (e.g., animations)
 * }
 * ```
 *
 * @template TData - Data type carried during the preparing phase
 */
export function useTransaction<TData = any>(): UseTransactionReturn<TData> {
  const [state, setState] = useState<TxState<TData>>({ status: 'idle' })
  const config = useConfig()

  /**
   * Set preparing state (optional)
   * Used for starting validation and preparation work
   */
  const prepare = useCallback((data?: TData) => {
    setState({ status: 'preparing', data })
  }, [])

  /**
   * Execute transaction and wait for confirmation
   *
   * Important: This function waits for the transaction to be fully confirmed before returning
   * This allows callers to safely execute subsequent logic (e.g., animations) after await
   *
   * @param fn - Async function that returns a transaction hash
   */
  const execute = useCallback(async (fn: () => Promise<`0x${string}`>) => {
    try {
      setState({ status: 'signing' })

      const hash = await fn()

      setState({ status: 'submitted', hash })

      // Wait for transaction confirmation
      setState({ status: 'confirming', hash })
      const receipt = await waitForTransactionReceipt(config, { hash })

      setState({ status: 'success', hash, receipt })

    } catch (error) {
      setState({
        status: 'error',
        error: error instanceof Error ? error : new Error(String(error))
      })
      throw error // Re-throw error for caller to handle
    }
  }, [config])

  /**
   * Reset to idle state
   */
  const reset = useCallback(() => {
    setState({ status: 'idle' })
  }, [])

  /**
   * Retry failed transaction
   */
  const retry = useCallback(async (fn: () => Promise<`0x${string}`>) => {
    if (state.status === 'error') {
      await execute(fn)
    }
  }, [state.status, execute])

  // Helper getters
  const isIdle = state.status === 'idle'
  const isPreparing = state.status === 'preparing'
  const isSigning = state.status === 'signing'
  const isSubmitted = state.status === 'submitted'
  const isConfirming = state.status === 'confirming'
  const isSuccess = state.status === 'success'
  const isError = state.status === 'error'
  const isLoading = ['preparing', 'signing', 'submitted', 'confirming'].includes(state.status)

  return {
    state,
    prepare,
    execute,
    reset,
    retry,
    isIdle,
    isPreparing,
    isSigning,
    isSubmitted,
    isConfirming,
    isSuccess,
    isError,
    isLoading,
  }
}
