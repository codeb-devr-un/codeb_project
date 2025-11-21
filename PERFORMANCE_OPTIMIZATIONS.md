# React Performance Optimizations Guide

This guide documents the performance optimizations implemented in the CMS project.

## Overview

The following optimizations have been implemented to improve the performance of React components:

1. **Custom Optimization Hooks** (`/src/hooks/useOptimization.ts`)
2. **Virtualized Lists** for handling large datasets
3. **Memoization** of components and expensive calculations
4. **Lazy Loading** and code splitting
5. **Debouncing** for search and filter inputs

## 1. Custom Optimization Hooks

### useDebounce
Delays updating a value until after a specified delay period.

```typescript
const debouncedSearchTerm = useDebounce(searchTerm, 300)
```

### useThrottle
Limits the rate at which a function can be called.

```typescript
const throttledScroll = useThrottle(handleScroll, 100)
```

### useIntersectionObserver
Detects when an element enters the viewport (useful for lazy loading).

```typescript
const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 })
```

### useStableCallback
Prevents callback recreation on every render.

```typescript
const stableCallback = useStableCallback(myCallback)
```

## 2. Virtualized Lists

Virtualized lists render only visible items, dramatically improving performance for large datasets.

### VirtualizedList Component
Located at `/src/components/optimized/VirtualizedList.tsx`

```typescript
<VirtualizedList
  items={projects}
  height={600}
  itemHeight={120} // or a function for variable heights
  renderItem={(item, index, style) => (
    <div style={style}>
      {/* Your item content */}
    </div>
  )}
/>
```

### Usage Examples:
- **OptimizedTaskList**: Handles thousands of tasks efficiently
- **OptimizedProjectList**: Renders large project lists
- **OptimizedChat**: Manages long chat histories

## 3. Component Memoization

### React.memo
Prevents unnecessary re-renders when props haven't changed.

```typescript
const TaskItem = memo(({ task, onClick }) => {
  // Component implementation
})
```

### useMemo
Memoizes expensive calculations.

```typescript
const filteredTasks = useMemo(() => {
  return tasks.filter(task => task.status === filter)
}, [tasks, filter])
```

### useCallback
Memoizes callback functions.

```typescript
const handleClick = useCallback((id) => {
  // Handle click
}, [dependency])
```

## 4. Lazy Loading

### LazyComponent Wrapper
Located at `/src/components/optimized/LazyComponent.tsx`

```typescript
const AdminDashboard = lazy(() => import('./dashboards/AdminDashboard'))

<LazyComponent component={AdminDashboard} />
```

### Route-based Code Splitting
```typescript
// Preload components likely to be used
preloadComponent(() => import('./HeavyComponent'))
```

## 5. Optimized Components

### OptimizedDashboard
- Lazy loads role-specific dashboards
- Memoizes dashboard selection logic
- Implements suspense boundaries

### OptimizedTaskList
- Virtualized rendering for large task lists
- Debounced search functionality
- Memoized filtering and sorting
- Dynamic item heights based on content

### OptimizedProjectList
- Virtualized project cards
- Optimized status calculations
- Memoized date calculations
- Efficient sorting algorithms

### OptimizedChat
- Virtualized message list
- Dynamic message height calculation
- Debounced search
- Optimized date separators

## Performance Best Practices

### 1. Use Virtualization for Long Lists
```typescript
// Instead of rendering all items
{items.map(item => <Item key={item.id} {...item} />)}

// Use virtualized list
<VirtualizedList items={items} ... />
```

### 2. Memoize Expensive Operations
```typescript
// Memoize filtered results
const filtered = useMemo(() => 
  items.filter(item => item.matches(criteria)),
  [items, criteria]
)
```

### 3. Debounce User Input
```typescript
// Debounce search input
const debouncedSearch = useDebounce(searchTerm, 300)

useEffect(() => {
  performSearch(debouncedSearch)
}, [debouncedSearch])
```

### 4. Lazy Load Heavy Components
```typescript
// Split code at route level
const HeavyFeature = lazy(() => import('./HeavyFeature'))

// Render with suspense
<Suspense fallback={<Loading />}>
  <HeavyFeature />
</Suspense>
```

### 5. Optimize Re-renders
```typescript
// Use memo for pure components
const PureComponent = memo(({ data }) => {
  return <div>{data}</div>
})

// Use callback for stable references
const stableHandler = useCallback(() => {
  // Handle event
}, [dependency])
```

## Measuring Performance

### React DevTools Profiler
1. Open React DevTools
2. Navigate to Profiler tab
3. Start recording
4. Interact with your app
5. Stop recording and analyze

### Performance Metrics
- **Render time**: Time taken to render components
- **Commit time**: Time to apply DOM changes
- **Interaction time**: Time from user input to visual update

### Custom Performance Monitoring
```typescript
// Measure component render time
const startTime = performance.now()
// ... component logic
const endTime = performance.now()
console.log(`Render took ${endTime - startTime}ms`)
```

## Migration Guide

To migrate existing components to use optimizations:

1. **Identify Performance Bottlenecks**
   - Use React DevTools Profiler
   - Check for components rendering frequently
   - Look for expensive calculations

2. **Apply Optimizations**
   - Wrap components with `memo()`
   - Replace long lists with `VirtualizedList`
   - Add `useDebounce` to search inputs
   - Use `useMemo` for expensive calculations

3. **Test Performance**
   - Measure before and after
   - Test with large datasets
   - Verify user experience improvements

## Example Migration

### Before:
```typescript
function TaskList({ tasks }) {
  const [search, setSearch] = useState('')
  
  const filtered = tasks.filter(task => 
    task.title.includes(search)
  )
  
  return (
    <div>
      <input onChange={e => setSearch(e.target.value)} />
      {filtered.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  )
}
```

### After:
```typescript
const TaskList = memo(({ tasks }) => {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  
  const filtered = useMemo(() => 
    tasks.filter(task => 
      task.title.includes(debouncedSearch)
    ),
    [tasks, debouncedSearch]
  )
  
  return (
    <div>
      <input onChange={e => setSearch(e.target.value)} />
      <VirtualizedList
        items={filtered}
        height={600}
        itemHeight={80}
        renderItem={(task, index, style) => (
          <TaskItem key={task.id} task={task} style={style} />
        )}
      />
    </div>
  )
})
```

## Troubleshooting

### Common Issues

1. **Virtualized list not rendering**
   - Ensure height is specified
   - Check if items array is populated
   - Verify renderItem returns valid JSX

2. **Memoization not working**
   - Check if dependencies are stable
   - Ensure props are primitives or memoized
   - Verify comparison function if using custom

3. **Lazy loading errors**
   - Check import paths
   - Ensure default exports
   - Add error boundaries

4. **Debounce not triggering**
   - Verify delay is appropriate
   - Check if value is changing
   - Ensure effect dependencies are correct