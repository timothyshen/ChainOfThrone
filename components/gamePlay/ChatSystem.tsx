import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from "@/lib/utils"
import { PushAPI, CONSTANTS } from '@pushprotocol/restapi';
import { walletClient } from '@/lib/contract/client';


type Player = {
    id: string
    name: string
    isReady: boolean
    supplyCenters: number
}

type ChatMessage = {
    senderId: string
    recipientId: string
    content: string
    timestamp: number
    type?: 'negotiation'
    responded?: boolean
}

function ChatSystem({ players, currentPlayerId, onSendMessage }: { players: Player[], currentPlayerId: string, onSendMessage: (recipientId: string, content: string, type?: string) => void }) {
    const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null)
    const [messageContent, setMessageContent] = useState('')
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
    const chatContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
    }, [chatMessages])

    const handleSendMessage = async () => {
        if (selectedRecipient && messageContent.trim()) {
            const content = messageContent.trim()
            const isNegotiation = content.startsWith('/nego ')

            const newMessage: ChatMessage = {
                senderId: currentPlayerId,
                recipientId: selectedRecipient,
                content: isNegotiation ? content.substring(6) : content,
                timestamp: Date.now(),
                ...(isNegotiation && { type: 'negotiation' })
            }

            try {
                const userAlice = await PushAPI.initialize(walletClient, {
                    env: CONSTANTS.ENV.STAGING,
                });

                const recipientWallet = players.find(p => p.id === selectedRecipient)?.wallet
                if (recipientWallet) {
                    await userAlice.chat.send(recipientWallet, {
                        content: newMessage.content,
                        type: 'Text'
                    });
                }

                setChatMessages(prev => [...prev, newMessage])
                onSendMessage(selectedRecipient, newMessage.content, isNegotiation ? 'negotiation' : undefined)
                setMessageContent('')

            } catch (error) {
                console.error('Error sending message:', error)
            }
        }
    }

    const renderMessage = (msg: ChatMessage, index: number) => {
        const isCurrentUser = msg.senderId === currentPlayerId
        const senderName = isCurrentUser ? 'You' : players.find(p => p.id === msg.senderId)?.name

        return (
            <div key={index} className={cn("mb-2", isCurrentUser ? "text-right" : "text-left")}>
                {msg.type === 'negotiation' ? (
                    <div className="inline-block bg-secondary p-3 rounded">
                        <p className="mb-2">{msg.content}</p>
                        {!msg.responded && !isCurrentUser && (
                            <div className="flex gap-2 justify-end">
                                <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => {
                                        onSendMessage(msg.senderId, `Accepted: ${msg.content}`)
                                        const updatedMessages = [...chatMessages]
                                        if (updatedMessages[index] == null) return ""
                                        updatedMessages[index] = {
                                            ...updatedMessages[index],
                                            responded: true
                                        }
                                        setChatMessages(updatedMessages)
                                    }}
                                >
                                    Yes
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                        onSendMessage(msg.senderId, `Declined: ${msg.content}`)
                                        const updatedMessages = [...chatMessages]
                                        if (updatedMessages[index] == null) return ""
                                        updatedMessages[index].responded = true
                                        setChatMessages(updatedMessages)
                                    }}
                                >
                                    No
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <span className="inline-block bg-primary text-primary-foreground rounded px-2 py-1">
                        {msg.content}
                    </span>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                    {senderName} - {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
            </div>
        )
    }

    return (
        <Card className="w-full h-full flex flex-col">
            <CardHeader>
                <CardTitle>Diplomacy Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
                <Select onValueChange={(value) => setSelectedRecipient(value)}>
                    <SelectTrigger className="w-full mb-4">
                        <SelectValue placeholder="Select a player to message" />
                    </SelectTrigger>
                    <SelectContent>
                        {players.filter(p => p.id !== currentPlayerId).map(player => (
                            <SelectItem key={player.id} value={player.id}>{player.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <ScrollArea className="flex-grow mb-4 p-4 border rounded" ref={chatContainerRef}>
                    {chatMessages
                        .filter(msg => msg.senderId === currentPlayerId || msg.recipientId === currentPlayerId)
                        .map((msg, index) => renderMessage(msg, index))}
                </ScrollArea>
                <div className="flex">
                    <Input
                        type="text"
                        placeholder="Type your message..."
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        className="flex-grow mr-2"
                    />
                    <Button onClick={handleSendMessage} disabled={!selectedRecipient || !messageContent.trim()}>Send</Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default ChatSystem