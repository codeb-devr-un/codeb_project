'use client'

import React, { useCallback, useRef } from 'react'
import { VariableSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

interface VirtualizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemHeight?: number | ((index: number) => number)
  overscan?: number
  className?: string
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight = 50,
  overscan = 5,
  className = ''
}: VirtualizedListProps<T>) {
  const listRef = useRef<List>(null)
  
  const getItemSize = useCallback(
    (index: number) => {
      if (typeof itemHeight === 'function') {
        return itemHeight(index)
      }
      return itemHeight
    },
    [itemHeight]
  )
  
  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => (
      <div style={style}>
        {renderItem(items[index], index)}
      </div>
    ),
    [items, renderItem]
  )
  
  return (
    <div className={`h-full w-full ${className}`}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            ref={listRef}
            height={height}
            itemCount={items.length}
            itemSize={getItemSize}
            overscanCount={overscan}
            width={width}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  )
}

// 검색 가능한 가상화 리스트
export function SearchableVirtualizedList<T>({
  items,
  renderItem,
  searchKey,
  placeholder = '검색...',
  ...props
}: VirtualizedListProps<T> & {
  searchKey: keyof T
  placeholder?: string
}) {
  const [searchTerm, setSearchTerm] = React.useState('')
  
  const filteredItems = React.useMemo(() => {
    if (!searchTerm) return items
    
    return items.filter(item => {
      const value = String(item[searchKey]).toLowerCase()
      return value.includes(searchTerm.toLowerCase())
    })
  }, [items, searchTerm, searchKey])
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      <div className="flex-1">
        <VirtualizedList
          {...props}
          items={filteredItems}
          renderItem={renderItem}
        />
      </div>
    </div>
  )
}