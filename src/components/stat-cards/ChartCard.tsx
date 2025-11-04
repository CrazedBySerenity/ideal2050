import { useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { StatCard } from './StatCard'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

interface ChartCardProps {
  title: string
  icon?: React.ComponentType<{ className?: string }>
  data: Array<{ time: number; value: number }>
  color?: string
  unit?: string
  className?: string
  yAxisDomain?: [number, number]
}

export function ChartCard({
  title,
  icon: Icon,
  data,
  color = 'hsl(var(--chart-1))',
  unit = '',
  className,
  yAxisDomain,
}: ChartCardProps) {
  const [displayData, setDisplayData] = useState(data)

  useEffect(() => {
    // Smooth transition when data changes
    setDisplayData(data)
  }, [data])

  const chartConfig: ChartConfig = {
    value: {
      label: title,
      color,
    },
  }

  const chartData = useMemo(
    () =>
      displayData.map((point) => ({
        time: point.time,
        value: point.value,
      })),
    [displayData]
  )

  return (
    <StatCard title={title} icon={Icon} className={className}>
      <ChartContainer config={chartConfig}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tickFormatter={(value) => {
              const hours = Math.floor(value)
              const minutes = Math.floor((value - hours) * 60)
              return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
            }}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            domain={yAxisDomain || [0, 'auto']}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value: unknown) => [
                  `${typeof value === 'number' ? value.toFixed(1) : value}${unit}`,
                  title,
                ]}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.2}
            strokeWidth={2}
            animationDuration={300}
          />
        </AreaChart>
      </ChartContainer>
    </StatCard>
  )
}

