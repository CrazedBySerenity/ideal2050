import { useMemo } from 'react'
import { useTimeReplay } from '@/hooks/useTimeReplay'
import { TimeControls } from '@/components/TimeControls'
import { CombinedValueCard } from '@/components/stat-cards/CombinedValueCard'
import { ChartCard } from '@/components/stat-cards/ChartCard'
import { NutritionCard } from '@/components/stat-cards/NutritionCard'
import {
  getSunshine,
  getPulse,
  getSocialConnections,
  getNutrition,
  getAirQuality,
} from '@/data/dayData'
import { Sun, Heart, UtensilsCrossed, Wind } from 'lucide-react'

function App() {
  const timeControls = useTimeReplay()
  const { currentTime } = timeControls

  // Get current stat values
  const sunshine = useMemo(() => getSunshine(currentTime), [currentTime])
  const airQuality = useMemo(() => getAirQuality(currentTime), [currentTime])

  // Throttle nutrition updates to every 5 minutes of simulated time for smoother CSS transitions
  // This reduces calculation frequency while CSS transitions handle the smooth animation
  const nutrition = useMemo(() => {
    const updateIntervalMinutes = 5 // Update every 5 minutes of simulated time
    const updateIntervalHours = updateIntervalMinutes / 60
    // Round to nearest interval instead of floor to avoid lag
    const throttledTime = Math.round(currentTime / updateIntervalHours) * updateIntervalHours
    return getNutrition(throttledTime)
  }, [currentTime])

  // Generate historical data for charts (only up to current time for pulse)
  const chartData = useMemo(() => {
    // Generate pulse data points every 5 minutes (0.083 hours) up to current time
    const pulsePoints: number[] = []
    const intervalMinutes = 5 // default 5 minutes
    const intervalHours = intervalMinutes / 60
    
    for (let time = 0; time <= currentTime; time += intervalHours) {
      pulsePoints.push(time)
    }
    // Ensure we include the exact current time
    if (pulsePoints[pulsePoints.length - 1] !== currentTime) {
      pulsePoints.push(currentTime)
    }

    // Generate social connections data points every hour (for full 24 hours)
    const socialPoints: number[] = []
    for (let i = 0; i <= 24; i++) {
      socialPoints.push(i)
    }

    return {
      pulse: pulsePoints.map((time) => ({
        time,
        value: getPulse(time),
      })),
      socialConnections: socialPoints.map((time) => ({
        time,
        value: getSocialConnections(time),
      })),
    }
  }, [currentTime])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">A Day in 2050</h1>
          <p className="text-muted-foreground">
            Experience life in an ideal world through time-based statistics
          </p>
        </div>

        {/* Time Controls */}
        <TimeControls controls={timeControls} />

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sunshine & Air Quality */}
          <CombinedValueCard
            title1="Sunshine"
            icon1={Sun}
            value1={sunshine}
            unit1="%"
            formatValue1={(v: number) => Math.round(v).toString()}
            title2="Air Quality"
            icon2={Wind}
            value2={airQuality}
            unit2=" PPM"
            formatValue2={(v: number) => Math.round(v).toString()}
          />

          {/* Pulse */}
          <ChartCard
            title="Pulse"
            icon={Heart}
            data={chartData.pulse}
            color="hsl(var(--chart-2))"
            unit=" BPM"
            yAxisDomain={[0, 200]}
          />

          {/* Social Connections */}
          {/* <ChartCard
            title="Social Connections"
            icon={Users}
            data={chartData.socialConnections}
            color="hsl(var(--chart-3))"
            unit=" connections"
          /> */}

          {/* Nutrition */}
          <NutritionCard
            title="Nutrition"
            icon={UtensilsCrossed}
            nutrition={nutrition}
          />

        </div>
      </div>
    </div>
  )
}

export default App
