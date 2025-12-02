'use client'

import React from 'react'
import CalendarView from '@/components/calendar/CalendarView'

export default function CalendarPage() {
  return (
    <div className="h-[calc(100vh-4rem)] p-4">
      <CalendarView />
    </div>
  )
}