import { StatCard } from './StatCard'

interface CombinedValueCardProps {
  title1: string
  icon1?: React.ComponentType<{ className?: string }>
  value1: number
  unit1?: string
  formatValue1?: (value: number) => string
  title2: string
  icon2?: React.ComponentType<{ className?: string }>
  value2: number
  unit2?: string
  formatValue2?: (value: number) => string
  className?: string
}

export function CombinedValueCard({
  title1,
  icon1: Icon1,
  value1,
  unit1 = '',
  formatValue1,
  title2,
  icon2: Icon2,
  value2,
  unit2 = '',
  formatValue2,
  className,
}: CombinedValueCardProps) {
  return (
    <StatCard title="" className={className}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {Icon1 && <Icon1 className="h-4 w-4" />}
            <span className="text-sm font-medium">{title1}</span>
          </div>
          <div className="text-2xl font-bold tabular-nums">
            {formatValue1 ? formatValue1(value1) : value1.toFixed(unit1 === '%' ? 0 : 1)}
            {unit1 && <span className="text-lg font-normal text-muted-foreground ml-1">{unit1}</span>}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            {Icon2 && <Icon2 className="h-4 w-4" />}
            <span className="text-sm font-medium">{title2}</span>
          </div>
          <div className="text-2xl font-bold tabular-nums">
            {formatValue2 ? formatValue2(value2) : value2.toFixed(unit2 === '%' ? 0 : 1)}
            {unit2 && <span className="text-lg font-normal text-muted-foreground ml-1">{unit2}</span>}
          </div>
        </div>
      </div>
    </StatCard>
  )
}

