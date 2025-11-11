'use client'

import { useState, useCallback } from 'react'
import { useWaitForTransactionReceipt } from 'wagmi'
import type { TxState, UseTransactionReturn } from '@/lib/types/transaction'

/**
 * 统一的 Transaction 状态管理 Hook
 *
 * 基于状态机设计，消除状态分裂问题
 *
 * 使用方法:
 * ```tsx
 * const tx = useTransaction()
 * const { makeMove } = useMakeMove()
 *
 * const handleMove = async () => {
 *   tx.prepare({ armyId: '123' })
 *   await tx.execute(() => makeMove(gameAddress, move))
 * }
 * ```
 *
 * @template TData - preparing 阶段携带的数据类型
 */
export function useTransaction<TData = any>(): UseTransactionReturn<TData> {
  const [state, setState] = useState<TxState<TData>>({ status: 'idle' })

  // 等待交易确认
  const { data: receipt } = useWaitForTransactionReceipt({
    hash: state.status === 'submitted' || state.status === 'confirming'
      ? state.hash
      : undefined,
  })

  // 当收到 receipt 时，更新状态为 success
  if (receipt && (state.status === 'submitted' || state.status === 'confirming')) {
    setState({ status: 'success', hash: state.hash, receipt })
  }

  /**
   * 设置 preparing 状态（可选）
   * 用于开始动画、验证等准备工作
   */
  const prepare = useCallback((data?: TData) => {
    setState({ status: 'preparing', data })
  }, [])

  /**
   * 执行交易
   * @param fn - 返回 transaction hash 的异步函数
   */
  const execute = useCallback(async (fn: () => Promise<`0x${string}`>) => {
    try {
      setState({ status: 'signing' })

      const hash = await fn()

      setState({ status: 'submitted', hash })

      // 状态会在收到 receipt 时自动更新为 success
      // 见上面的 useWaitForTransactionReceipt 逻辑

    } catch (error) {
      setState({
        status: 'error',
        error: error instanceof Error ? error : new Error(String(error))
      })
    }
  }, [])

  /**
   * 重置到 idle 状态
   */
  const reset = useCallback(() => {
    setState({ status: 'idle' })
  }, [])

  /**
   * 重试失败的交易
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
