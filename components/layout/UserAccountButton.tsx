'use client'

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { monadTestnet } from "viem/chains"
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
  useBalance,
} from "wagmi"
import { metaMask } from "wagmi/connectors"
import {
  Copy,
  ExternalLink,
  LogOut,
  RefreshCw,
  CheckCircle2,
} from "lucide-react"
import { useState } from "react"
import { useToast } from "@/lib/hooks/use-toast"

export default function UserAccountButton() {
  const { address, isConnected, chainId } = useAccount()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { connect } = useConnect()
  const { data: balance } = useBalance({ address })
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const handleCopyAddress = async () => {
    if (!address) return

    await navigator.clipboard.writeText(address)
    setCopied(true)
    toast({
      title: "地址已复制",
      description: "钱包地址已复制到剪贴板",
    })

    setTimeout(() => setCopied(false), 2000)
  }

  const handleViewExplorer = () => {
    if (!address) return
    window.open(`https://explorer.testnet.monad.xyz/address/${address}`, '_blank')
  }

  const handleDisconnect = () => {
    disconnect()
    toast({
      title: "钱包已断开",
      description: "您已成功断开钱包连接",
    })
  }

  const handleSwitchChain = () => {
    switchChain({ chainId: monadTestnet.id })
  }

  // 未连接状态
  if (!isConnected) {
    return (
      <Button
        size="sm"
        variant="secondary"
        onClick={() => connect({ connector: metaMask() })}
      >
        Connect Wallet
      </Button>
    )
  }

  // 已连接状态 - Dropdown
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''
  const isCorrectChain = chainId === monadTestnet.id

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isCorrectChain ? "secondary" : "destructive"}
          size="sm"
          className="flex items-center gap-2"
        >
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {address?.slice(2, 4).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline">{shortAddress}</span>
          {!isCorrectChain && (
            <span className="hidden md:inline text-xs">(Wrong Network)</span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        {/* 钱包地址 */}
        <div className="px-3 py-2">
          <p className="text-xs text-muted-foreground mb-1">钱包地址</p>
          <div className="flex items-center justify-between gap-2">
            <code className="text-sm font-mono">{shortAddress}</code>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleCopyAddress}
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleViewExplorer}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* 余额和网络信息 */}
        <div className="px-3 py-2 space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">余额</p>
            <p className="text-sm font-medium">
              {balance
                ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
                : 'Loading...'
              }
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">网络</p>
            <p className="text-sm font-medium flex items-center gap-1">
              {isCorrectChain ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Monad Testnet
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Wrong Network
                </>
              )}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* 操作按钮 */}
        {!isCorrectChain && (
          <DropdownMenuItem onClick={handleSwitchChain}>
            <RefreshCw className="mr-2 h-4 w-4" />
            <span>切换到 Monad Testnet</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={handleDisconnect}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>断开连接</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
