'use client'
const isDev = process.env.NODE_ENV === 'development'

import { createContext, useContext, useEffect, useState } from 'react'

type SocketContextType = {
    socket: any | null
    isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
})

export const useSocket = () => {
    return useContext(SocketContext)
}

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<any | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return

        // Socket.io server URL - production uses the same domain, dev uses localhost:3011
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL ||
            (typeof window !== 'undefined' && window.location.hostname === 'localhost'
                ? 'http://localhost:3011'
                : process.env.NEXT_PUBLIC_SITE_URL || '')

        if (!socketUrl) {
      if (isDev) console.warn('Socket.io: No server URL configured')
            return
        }

        let socketInstance: any = null

        const initSocket = async () => {
            try {
                const { io } = await import('socket.io-client')

                socketInstance = io(socketUrl, {
                    path: '/socket.io',
                    addTrailingSlash: false,
                    transports: ['websocket', 'polling'],
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                })

                socketInstance.on('connect', () => {
      if (isDev) console.log('Socket.io connected:', socketInstance.id)
                    setIsConnected(true)
                })

                socketInstance.on('disconnect', () => {
      if (isDev) console.log('Socket.io disconnected')
                    setIsConnected(false)
                })

                socketInstance.on('connect_error', (err: Error) => {
      if (isDev) console.warn('Socket.io connection error:', err.message)
                })

                setSocket(socketInstance)
            } catch (error) {
      if (isDev) console.warn('Socket.io initialization failed:', error)
            }
        }

        initSocket()

        return () => {
            if (socketInstance) {
                socketInstance.disconnect()
            }
        }
    }, [mounted])

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    )
}
