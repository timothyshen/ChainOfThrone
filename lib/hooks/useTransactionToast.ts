'use client'

import { useEffect, useRef } from 'react'
import { useToast } from '@/lib/hooks/use-toast'
import type { TxState, TxToastMessages } from '@/lib/types/transaction'

/**
 * 自动显示 Transaction Toast 通知
 *
 * 监听 transaction state 变化，自动显示对应的 toast
 *
 * 使用方法:
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
    // 只在状态变化时触发，避免重复 toast
    if (prevStatusRef.current === state.status) return
    prevStatusRef.current = state.status

    if (state.status === 'submitted') {
      toast({
        title: '交易已提交',
        description: messages?.submitted || 'Waiting for blockchain confirmation...',
      })
    }

    if (state.status === 'success') {
      toast({
        title: '✓ 成功',
        description: messages?.success || 'Transaction confirmed successfully!',
        variant: 'default',
      })
    }

    if (state.status === 'error') {
      toast({
        title: '失败',
        description: messages?.error || state.error.message || 'Transaction failed',
        variant: 'destructive',
      })
    }
  }, [state.status, toast, messages])
}
