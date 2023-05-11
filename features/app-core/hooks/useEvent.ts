import { useRef, useLayoutEffect, useCallback } from 'react'

export default function useEvent(handler) {
  const handlerRef = useRef(null)

  // In a real implementation, this would run before layout effects
  useLayoutEffect(() => {
    handlerRef.current = handler
  })

  return useCallback((...args) => {
    // In a real implementation, this would throw if called during render
    const fn = handlerRef.current
    if (!fn) throw new Error('Event handler is not defined')
    // @ts-ignore
    return fn(...args)
  }, [])
}
