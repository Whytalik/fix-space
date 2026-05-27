// apps/web/app/_components/dashboard/mock-chart-data.ts

/**
 * Generates dynamic, realistic-looking data for a 7-day week up to today.
 * @param key The key to use for the value (e.g., 'pnl', 'winrate').
 * @param min The minimum value for the random range.
 * @param max The maximum value for the random range.
 * @param decimals The number of decimal places for the value.
 */
const generateWeeklyData = (key: string, min: number, max: number, decimals = 0) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  let currentDayIndex = today.getDay() - 1;
  if (currentDayIndex === -1) currentDayIndex = 6; // Sunday is 0, make it 6

  return days.map((day, index) => {
    // Only generate data for days up to today
    if (index > currentDayIndex) {
      return { name: day }; // No value for future days
    }

    const value = Math.random() * (max - min) + min;
    return {
      name: day,
      [key]: parseFloat(value.toFixed(decimals)),
    };
  });
};

// Generate data for the current week up to today
export const pnlData = generateWeeklyData("pnl", -200, 500, 0);
export const winRateData = generateWeeklyData("winrate", 45, 75, 0);
export const rrDeviationData = generateWeeklyData("deviation", -0.8, 0.8, 1);
