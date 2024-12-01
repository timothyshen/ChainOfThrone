'use client'

import { useState, useEffect } from 'react'
import { Toast, ToastProvider, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/lib/hooks/use-toast"

export function NotificationCenter() {
    const { toast } = useToast()
    const [notifications, setNotifications] = useState([])

    useEffect(() => {
        const interval = setInterval(() => {
            const newNotification = {
                id: Date.now(),
                title: "Game Update",
                description: `A new game has been created: 0x${Math.random().toString(16).slice(2, 10)}`,
            }
            setNotifications(prev => [...prev, newNotification])
            toast(newNotification)
        }, 30000) // New notification every 30 seconds

        return () => clearInterval(interval)
    }, [toast])

    return (
        <ToastProvider>
            {notifications.map((notification) => (
                <Toast key={notification.id}>
                    <div className="grid gap-1">
                        <h3 className="font-medium">{notification.title}</h3>
                        <p className="text-sm text-gray-400">{notification.description}</p>
                    </div>
                </Toast>
            ))}
            <ToastViewport />
        </ToastProvider>
    )
}

