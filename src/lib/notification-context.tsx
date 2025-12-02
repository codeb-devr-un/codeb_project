'use client'
// =============================================================================
// Notification Context - CVE-CB-005 Fixed: Development-only Logging
// =============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const isDev = process.env.NODE_ENV === 'development'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
  requestPermission: () => Promise<boolean>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    // 브라우저 알림 권한 상태 확인
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    }

    setNotifications(prev => [newNotification, ...prev])

    // 토스트 알림 표시
    switch (notification.type) {
      case 'success':
        toast.success(notification.message)
        break
      case 'error':
        toast.error(notification.message)
        break
      case 'warning':
        toast(notification.message, { icon: '⚠️' })
        break
      default:
        toast(notification.message)
    }

    // 브라우저 알림 표시 (권한이 있을 경우)
    if (permission === 'granted' && document.hidden) {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: newNotification.id,
      })
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      // CVE-CB-005: Development-only logging
      if (isDev) console.log('[DEV] 이 브라우저는 알림을 지원하지 않습니다.')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    } catch {
      // CVE-CB-005: Silent fail for notification permission
      if (isDev) console.log('[DEV] 알림 권한 요청 실패')
      return false
    }
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      requestPermission,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}