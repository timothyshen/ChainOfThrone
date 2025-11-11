/**
 * Transaction State Machine Types
 *
 * 使用 discriminated union 确保类型安全
 * 每个状态只能携带对应的数据
 */

export type TxState<TData = any> =
  | { status: 'idle' }
  | { status: 'preparing'; data?: TData }
  | { status: 'signing' }
  | { status: 'submitted'; hash: `0x${string}` }
  | { status: 'confirming'; hash: `0x${string}` }
  | { status: 'success'; hash: `0x${string}`; receipt?: any }
  | { status: 'error'; error: Error }

/**
 * Transaction Hook Return Type
 */
export interface UseTransactionReturn<TData = any> {
  // 状态
  state: TxState<TData>

  // 操作
  prepare: (data?: TData) => void
  execute: (fn: () => Promise<`0x${string}`>) => Promise<void>
  reset: () => void
  retry: (fn: () => Promise<`0x${string}`>) => Promise<void>

  // Helper getters
  isIdle: boolean
  isPreparing: boolean
  isSigning: boolean
  isSubmitted: boolean
  isConfirming: boolean
  isSuccess: boolean
  isError: boolean
  isLoading: boolean
}

/**
 * Transaction Toast Messages
 */
export interface TxToastMessages {
  submitted?: string
  success?: string
  error?: string
}
