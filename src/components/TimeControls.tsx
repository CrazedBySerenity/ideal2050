import { Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent } from '@/components/ui/card'
import type { TimeReplayControls } from '@/hooks/useTimeReplay'

interface TimeControlsProps {
  controls: TimeReplayControls
}

function formatTime(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.floor((hours - h) * 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export function TimeControls({ controls }: TimeControlsProps) {
  const { currentTime, isPlaying, togglePlay, reset, seek } = controls

  return (
    <Card className="w-full">
      <CardContent className="flex flex-col gap-4 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={reset}
              aria-label="Reset"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <div className="ml-4 text-sm font-mono tabular-nums">
              {formatTime(currentTime)}
            </div>
          </div>
        </div>
        <Slider
          value={[currentTime]}
          onValueChange={([value]: number[]) => seek(value)}
          min={0}
          max={24}
          step={0.01}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>00:00</span>
          <span>24:00</span>
        </div>
      </CardContent>
    </Card>
  )
}

