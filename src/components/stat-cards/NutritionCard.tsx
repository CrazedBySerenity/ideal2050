import { useEffect, useState } from 'react'
import { StatCard } from './StatCard'
import { Progress } from '@/components/ui/progress'
import type { NutritionData, FoodGroup } from '@/data/dayData'
import { cn } from '@/lib/utils'

interface NutritionCardProps {
  title: string
  icon?: React.ComponentType<{ className?: string }>
  nutrition: NutritionData
  className?: string
}

const DAILY_ENERGY_GOAL = 2100 // calories

const FOOD_GROUP_LABELS: Record<FoodGroup, string> = {
  wholeGrains: 'Whole Grains',
  vegetables: 'Vegetables',
  fruits: 'Fruits',
  legumes: 'Legumes',
  nuts: 'Nuts',
  dairy: 'Dairy',
  fish: 'Fish',
  poultry: 'Poultry',
  redMeat: 'Red Meat',
  addedFats: 'Added Fats',
}

const FOOD_GROUP_COLORS: Record<FoodGroup, string> = {
  wholeGrains: 'bg-amber-500',
  vegetables: 'bg-green-500',
  fruits: 'bg-purple-500',
  legumes: 'bg-orange-500',
  nuts: 'bg-yellow-600',
  dairy: 'bg-blue-400',
  fish: 'bg-cyan-500',
  poultry: 'bg-pink-400',
  redMeat: 'bg-red-500',
  addedFats: 'bg-gray-400',
}

export function NutritionCard({
  title,
  icon: Icon,
  nutrition,
  className,
}: NutritionCardProps) {
  const [displayNutrition, setDisplayNutrition] = useState(nutrition)

  useEffect(() => {
    setDisplayNutrition(nutrition)
  }, [nutrition])

  const energyPercentage = Math.min(100, (displayNutrition.energy / DAILY_ENERGY_GOAL) * 100)

  // Get food groups with non-zero percentages, sorted by percentage
  const foodGroupEntries = Object.entries(displayNutrition.foodGroups)
    .filter(([_, percentage]) => percentage > 0)
    .sort(([_, a], [__, b]) => b - a) as Array<[FoodGroup, number]>

  // Format time for meal display
  const formatMealTime = (time: number): string => {
    const h = Math.floor(time)
    const m = Math.floor((time - h) * 60)
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }

  return (
    <StatCard title={title} icon={Icon} className={className}>
      <div className="space-y-4">
        {/* Energy Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Energy</span>
          </div>
          <Progress
            value={energyPercentage}
            className="h-3"
          />
        </div>

        {/* Food Groups Bar */}
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Food Groups</div>
          <div className="h-8 w-full rounded-md overflow-hidden border border-border flex">
            {foodGroupEntries.map(([group, percentage]) => (
              <div
                key={group}
                className={cn(
                  FOOD_GROUP_COLORS[group],
                  'transition-all duration-300',
                  'scale-105'
                )}
                style={{
                  width: `${percentage}%`,
                  minWidth: percentage > 0 ? '2px' : '0',
                }}
                title={`${FOOD_GROUP_LABELS[group]}: ${percentage.toFixed(1)}%`}
              />
            ))}
            {foodGroupEntries.length === 0 && (
              <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                No meals yet
              </div>
            )}
          </div>
          {/* Food Group Legend */}
          {foodGroupEntries.length > 0 && (
            <div className="flex flex-wrap gap-1.5 text-xs">
              {foodGroupEntries.map(([group, percentage]) => (
                <div
                  key={group}
                  className="flex items-center gap-1"
                  title={`${percentage.toFixed(1)}%`}
                >
                  <div
                    className={cn(
                      FOOD_GROUP_COLORS[group],
                      'w-2 h-2 rounded-sm'
                    )}
                  />
                  <span className="text-muted-foreground">
                    {FOOD_GROUP_LABELS[group]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transaction Sheet Style Meal Menu */}
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground border-b border-border pb-1">
            Meals
          </div>
          <div className="space-y-1">
            {displayNutrition.meals.length === 0 ? (
              <div className="text-xs text-muted-foreground py-2 text-center">
                No meals yet
              </div>
            ) : (
              displayNutrition.meals.map((meal, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-center justify-between text-xs py-1.5 px-2 rounded border border-border bg-muted/30 transition-all duration-300',
                    'scale-105'
                  )}
                >
                  <span className="font-medium">{meal.label}</span>
                  <span className="text-muted-foreground font-mono">
                    {formatMealTime(meal.time)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </StatCard>
  )
}
