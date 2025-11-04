import { useEffect, useState } from 'react'
import { StatCard } from './StatCard'
import { cn } from '@/lib/utils'

interface SingleValueCardProps {
  title: string
  icon?: React.ComponentType<{ className?: string }>
  value: number
  unit?: string
  formatValue?: (value: number) => string
  className?: string
}

export function SingleValueCard({
  title,
  icon: Icon,
  value,
  unit = '',
  formatValue,
  className,
}: SingleValueCardProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const timeout = setTimeout(() => {
      setDisplayValue(value)
      setIsAnimating(false)
    }, 50)

    return () => clearTimeout(timeout)
  }, [value])

  const formattedValue = formatValue
    ? formatValue(displayValue)
    : displayValue.toFixed(unit === '%' ? 0 : 1)

  return (
    <StatCard title={title} icon={Icon} className={className}>
      <div
        className={cn(
          'text-3xl font-bold tabular-nums transition-all duration-300',
          isAnimating && 'scale-110'
        )}
      >
        {formattedValue}
        {unit && <span className="text-xl font-normal text-muted-foreground ml-1">{unit}</span>}
      </div>
    </StatCard>
  )
}

