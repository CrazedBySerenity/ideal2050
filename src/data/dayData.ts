export type FoodGroup =
  | 'wholeGrains'
  | 'vegetables'
  | 'fruits'
  | 'legumes'
  | 'nuts'
  | 'dairy'
  | 'fish'
  | 'poultry'
  | 'redMeat'
  | 'addedFats'

export interface Meal {
  time: number // hours
  label: string
  energy: number // calories (for energy bar)
  foodGroups: Record<FoodGroup, number> // percentage contribution from each food group
}

export interface NutritionData {
  energy: number // total calories
  foodGroups: Record<FoodGroup, number> // percentage of food from each group
  meals: Meal[] // meals visible at current time
}

// Meals throughout the day
const MEALS: Meal[] = [
  {
    time: 7.5, // 7:30 AM - Breakfast
    label: 'Breakfast',
    energy: 450,
    foodGroups: {
      wholeGrains: 40,
      vegetables: 10,
      fruits: 20,
      legumes: 5,
      nuts: 10,
      dairy: 10,
      fish: 0,
      poultry: 0,
      redMeat: 0,
      addedFats: 5,
    },
  },
  {
    time: 12.5, // 12:30 PM - Lunch
    label: 'Lunch',
    energy: 600,
    foodGroups: {
      wholeGrains: 30,
      vegetables: 25,
      fruits: 10,
      legumes: 15,
      nuts: 5,
      dairy: 0,
      fish: 10,
      poultry: 0,
      redMeat: 0,
      addedFats: 5,
    },
  },
  {
    time: 19.0, // 7:00 PM - Dinner
    label: 'Dinner',
    energy: 700,
    foodGroups: {
      wholeGrains: 25,
      vegetables: 30,
      fruits: 5,
      legumes: 10,
      nuts: 5,
      dairy: 5,
      fish: 0,
      poultry: 15,
      redMeat: 0,
      addedFats: 5,
    },
  },
]

// Get meals visible at current time (meals stay visible once they appear)
function getVisibleMeals(time: number): Meal[] {
  return MEALS.filter((meal) => meal.time <= time)
}

// Calculate energy expenditure based on pulse using continuous integration
// Formula: calories burned per minute ≈ (pulse - 60) * 0.1 + 1.0
// Uses numerical integration (trapezoidal rule) for smooth continuous calculation
function calculateEnergyExpenditure(time: number): number {
  if (time <= 0) return 0

  // Use adaptive step size for integration
  // Smaller step size near current time for precision, larger steps for past time
  const stepSizeHours = 1 / 60 // 1 minute steps for accuracy
  const steps = Math.ceil(time / stepSizeHours)
  let totalCaloriesBurned = 0

  // Trapezoidal rule integration
  for (let i = 0; i < steps; i++) {
    const t1 = i * stepSizeHours
    const t2 = Math.min((i + 1) * stepSizeHours, time)
    
    const pulse1 = getPulse(t1)
    const pulse2 = getPulse(t2)
    
    // Calories per minute at each point
    const calPerMin1 = (pulse1 - 60) * 0.1 + 1.0
    const calPerMin2 = (pulse2 - 60) * 0.1 + 1.0
    
    // Average calories per minute over this interval
    const avgCalPerMin = (calPerMin1 + calPerMin2) / 2
    
    // Convert hours to minutes for the interval
    const intervalMinutes = (t2 - t1) * 60
    
    // Calories burned in this interval
    totalCaloriesBurned += avgCalPerMin * intervalMinutes
  }

  return totalCaloriesBurned
}

// Calculate food group percentages and total energy
function calculateNutritionUpToTime(time: number): NutritionData {
  const visibleMeals = getVisibleMeals(time)
  
  // Starting energy: 2/3 full (1400 calories)
  const STARTING_ENERGY = 1400
  
  // Calculate energy from meals
  const energyFromMeals = visibleMeals.reduce((sum, meal) => sum + meal.energy, 0)
  
  // Calculate energy expenditure based on pulse
  const energyExpended = calculateEnergyExpenditure(time)
  
  // Current energy = starting + meals - expenditure
  const currentEnergy = Math.max(0, STARTING_ENERGY + energyFromMeals - energyExpended)
  
  if (visibleMeals.length === 0) {
    return {
      energy: currentEnergy,
      foodGroups: {
        wholeGrains: 0,
        vegetables: 0,
        fruits: 0,
        legumes: 0,
        nuts: 0,
        dairy: 0,
        fish: 0,
        poultry: 0,
        redMeat: 0,
        addedFats: 0,
      },
      meals: [],
    }
  }

  // Calculate total energy from meals for food group weighting
  const totalMealEnergy = visibleMeals.reduce((sum, meal) => sum + meal.energy, 0)

  // Calculate weighted average of food groups
  const foodGroupTotals: Record<FoodGroup, number> = {
    wholeGrains: 0,
    vegetables: 0,
    fruits: 0,
    legumes: 0,
    nuts: 0,
    dairy: 0,
    fish: 0,
    poultry: 0,
    redMeat: 0,
    addedFats: 0,
  }

  visibleMeals.forEach((meal) => {
    Object.keys(meal.foodGroups).forEach((key) => {
      const foodGroup = key as FoodGroup
      // Weight by meal energy
      foodGroupTotals[foodGroup] +=
        meal.foodGroups[foodGroup] * (meal.energy / totalMealEnergy)
    })
  })

  return {
    energy: currentEnergy,
    foodGroups: foodGroupTotals,
    meals: visibleMeals,
  }
}

export function getSunshine(time: number): number {
  // Sunshine follows a curve: low at night, peaks around midday
  // Using a sine wave adjusted for 24-hour cycle
  const hour = time % 24
  if (hour >= 6 && hour <= 18) {
    // Daytime: 6 AM to 6 PM
    const normalizedHour = (hour - 6) / 12 // 0 to 1
    // Sine wave from 0 to π, peak at midday (12)
    const sunshine = Math.sin(normalizedHour * Math.PI) * 100
    return Math.max(0, Math.min(100, sunshine))
  }
  return 0 // Nighttime
}

export function getPulse(time: number): number {
  const hour = time % 24
  // Base resting heart rate around 60-70 BPM
  let base = 65

  // Sleep time (10 PM - 6 AM): lower resting rate
  if (hour >= 22 || hour < 6) {
    base = 55
  }

  // Activity periods:
  // Morning exercise (6-7 AM): higher
  if (hour >= 6 && hour < 7) {
    base = 120
  }
  // Midday activity (12-13 PM): moderate increase
  else if (hour >= 12 && hour < 13) {
    base = 85
  }
  // Afternoon activity (15-16 PM): moderate increase
  else if (hour >= 15 && hour < 16) {
    base = 80
  }
  // Evening activity (18-19 PM): moderate increase
  else if (hour >= 18 && hour < 19) {
    base = 90
  }

  // Add some variation (±5 BPM)
  const variation = (Math.sin(time * 2) * 5)
  return Math.round(base + variation)
}

export function getSocialConnections(time: number): number {
  const hour = time % 24
  // Social connections vary throughout the day
  // More connections during active hours

  if (hour >= 22 || hour < 6) {
    // Night/sleep: minimal connections
    return 0
  } else if (hour >= 8 && hour < 10) {
    // Morning commute/work start: moderate
    return 5
  } else if (hour >= 10 && hour < 12) {
    // Mid-morning: active
    return 12
  } else if (hour >= 12 && hour < 14) {
    // Lunch: peak social time
    return 18
  } else if (hour >= 14 && hour < 17) {
    // Afternoon: active
    return 15
  } else if (hour >= 17 && hour < 19) {
    // Evening commute/social: moderate-high
    return 10
  } else if (hour >= 19 && hour < 22) {
    // Evening social: moderate
    return 8
  } else {
    // Early morning: low
    return 2
  }
}

export function getMood(time: number): number {
  // Mood scale: 0-100, generally positive (2050 ideal world!)
  const hour = time % 24
  let base = 75 // Generally good mood

  // Morning mood boost after waking up
  if (hour >= 7 && hour < 9) {
    base = 85
  }
  // Peak mood during active social hours
  else if (hour >= 12 && hour < 14) {
    base = 90
  }
  // Evening relaxation
  else if (hour >= 19 && hour < 21) {
    base = 88
  }
  // Sleep time: neutral
  else if (hour >= 22 || hour < 6) {
    base = 65
  }

  // Add smooth variation
  const variation = Math.sin(time * 0.5) * 5
  return Math.max(0, Math.min(100, base + variation))
}

export function getNutrition(time: number): NutritionData {
  return calculateNutritionUpToTime(time)
}

export function getAirQuality(time: number): number {
  // Air quality measured in CO2 PPM (parts per million)
  // In ideal 2050 world, CO2 levels are excellent (350-400 PPM range)
  // Normal outdoor levels: 400-450 PPM
  // Excellent/ideal: 350-380 PPM
  const hour = time % 24

  // Base excellent air quality in ideal 2050
  let base = 365 // PPM - excellent level

  // Slightly better during early morning hours when less activity
  if (hour >= 5 && hour < 8) {
    base = 350 // Very clean air
  }
  // Slightly higher during peak hours (still excellent!)
  else if (hour >= 8 && hour < 10 || hour >= 17 && hour < 19) {
    base = 380 // Still excellent, just slightly elevated
  }
  // Nighttime can be slightly higher indoors
  else if (hour >= 22 || hour < 6) {
    base = 375
  }

  // Add smooth variation (±5 PPM)
  const variation = Math.sin(time * 0.3) * 5
  return Math.round(Math.max(350, Math.min(400, base + variation)))
}

