'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { TxState } from '@/lib/types/transaction'
import type { ButtonProps } from '@/components/ui/button'

/**
 * 通用的 Transaction 按钮组件
 *
 * 根据 transaction state 自动显示对应文本和样式
 * 自动处理 disabled/loading 状态
 *
 * 使用方法:
 * ```tsx
 * <TransactionButton
 *   state={tx.state}
 *   onClick={handleExecute}
 *   idleText="Move Army"
 *   successText="Army Moved!"
 * />
 * ```
 */
interface TransactionButtonProps extends Omit<ButtonProps, 'children' | 'disabled'> {
  state: TxState
  onClick: () => void
  idleText: React.ReactNode
  preparingText?: React.ReactNode
  signingText?: React.ReactNode
  submittedText?: React.ReactNode
  confirmingText?: React.ReactNode
  successText?: React.ReactNode
  errorText?: React.ReactNode
  showSpinner?: boolean
}

export function TransactionButton({
  state,
  onClick,
  idleText,
  preparingText = 'Preparing...',
  signingText = 'Sign in Wallet',
  submittedText = 'Submitting...',
  confirmingText = 'Confirming...',
  successText = '✓ Success',
  errorText = 'Try Again',
  showSpinner = true,
  variant,
  ...buttonProps
}: TransactionButtonProps) {
  // 状态 → UI 配置映射
  const config = {
    idle: {
      text: idleText,
      disabled: false,
      variant: variant || ('default' as const),
      loading: false,
    },
    preparing: {
      text: preparingText,
      disabled: true,
      variant: variant || ('default' as const),
      loading: true,
    },
    signing: {
      text: signingText,
      disabled: true,
      variant: variant || ('default' as const),
      loading: true,
    },
    submitted: {
      text: submittedText,
      disabled: true,
      variant: variant || ('default' as const),
      loading: true,
    },
    confirming: {
      text: confirmingText,
      disabled: true,
      variant: variant || ('default' as const),
      loading: true,
    },
    success: {
      text: successText,
      disabled: false,
      variant: 'default' as const,
      loading: false,
    },
    error: {
      text: errorText,
      disabled: false,
      variant: 'destructive' as const,
      loading: false,
    },
  }[state.status]

  return (
    <Button
      onClick={onClick}
      disabled={config.disabled}
      variant={config.variant}
      {...buttonProps}
    >
      {showSpinner && config.loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {config.text}
    </Button>
  )
}
