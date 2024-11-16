import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
}

function ChatSystem({ players, currentPlayerId, onSendMessage }: { players: Player[], currentPlayerId: string, onSendMessage: (recipientId: string, content: string) => void }) {
    const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null)
    const [messageContent, setMessageContent] = useState('')
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
    const chatContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
    }, [chatMessages])

    const handleSendMessage = () => {
        if (selectedRecipient && messageContent.trim()) {
            onSendMessage(selectedRecipient, messageContent.trim())
            setChatMessages(prev => [...prev, {
                senderId: currentPlayerId,
                recipientId: selectedRecipient,
                content: messageContent.trim(),
                timestamp: Date.now()
            }])
            setMessageContent('')
        }
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
                        .map((msg, index) => (
                            <div key={index} className={`mb-2 ${msg.senderId === currentPlayerId ? 'text-right' : 'text-left'}`}>
                                <span className="inline-block bg-primary text-primary-foreground rounded px-2 py-1">
                                    {msg.content}
                                </span>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {msg.senderId === currentPlayerId ? 'You' : players.find(p => p.id === msg.senderId)?.name}
                                    {' - '}
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        ))}
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