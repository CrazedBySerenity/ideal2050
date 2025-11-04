import { useState, useEffect, useRef, useCallback } from 'react'

const DAY_DURATION_MINUTES = 5 // 24 hours compressed to 5 minutes
const DAY_DURATION_MS = DAY_DURATION_MINUTES * 60 * 1000
const HOURS_IN_DAY = 24

export interface TimeReplayControls {
  currentTime: number // 0-24 hours
  isPlaying: boolean
  play: () => void
  pause: () => void
  reset: () => void
  seek: (time: number) => void // time in hours (0-24)
  togglePlay: () => void
}

export function useTimeReplay(
  onLoop?: () => void
): TimeReplayControls {
  const [currentTime, setCurrentTime] = useState(0) // in hours (0-24)
  const [isPlaying, setIsPlaying] = useState(false)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const startTimeRef = useRef<number>(0)
  const pausedTimeRef = useRef<number>(0)

  // Convert hours to milliseconds in the compressed timeline
  const hoursToMs = useCallback((hours: number) => {
    return (hours / HOURS_IN_DAY) * DAY_DURATION_MS
  }, [])

  // Convert milliseconds in compressed timeline to hours
  const msToHours = useCallback((ms: number) => {
    return (ms / DAY_DURATION_MS) * HOURS_IN_DAY
  }, [])

  const play = useCallback(() => {
    if (isPlaying) return
    setIsPlaying(true)
    startTimeRef.current = performance.now() - hoursToMs(pausedTimeRef.current)
  }, [isPlaying, hoursToMs])

  const pause = useCallback(() => {
    if (!isPlaying) return
    setIsPlaying(false)
    pausedTimeRef.current = msToHours(performance.now() - startTimeRef.current)
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [isPlaying, msToHours])

  const reset = useCallback(() => {
    setIsPlaying(false)
    setCurrentTime(0)
    pausedTimeRef.current = 0
    startTimeRef.current = 0
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  const seek = useCallback(
    (time: number) => {
      const clampedTime = Math.max(0, Math.min(HOURS_IN_DAY, time))
      setCurrentTime(clampedTime)
      pausedTimeRef.current = clampedTime
      if (isPlaying) {
        startTimeRef.current = performance.now() - hoursToMs(clampedTime)
      }
    },
    [isPlaying, hoursToMs]
  )

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, play, pause])

  useEffect(() => {
    if (!isPlaying) return

    const animate = () => {
      const elapsed = performance.now() - startTimeRef.current
      const hours = msToHours(elapsed)

      if (hours >= HOURS_IN_DAY) {
        // Day complete, loop back
        setCurrentTime(HOURS_IN_DAY)
        pausedTimeRef.current = 0
        startTimeRef.current = performance.now()
        onLoop?.()
      } else {
        setCurrentTime(hours)
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, msToHours, onLoop])

  return {
    currentTime,
    isPlaying,
    play,
    pause,
    reset,
    seek,
    togglePlay,
  }
}

