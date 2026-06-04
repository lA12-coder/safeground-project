export function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const sortedDates = dates.sort((a, b) => b.getTime() - a.getTime());
  let streak = 1;
  let currentDate = new Date(sortedDates[0]);

  for (let i = 1; i < sortedDates.length; i++) {
    const previousDate = new Date(sortedDates[i]);
    const dayDifference = Math.floor(
      (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (dayDifference === 1) {
      streak++;
      currentDate = previousDate;
    } else {
      break;
    }
  }

  return streak;
}

export function isStreakActive(lastLogDate: Date, dayThreshold: number = 1): boolean {
  const now = new Date();
  const daysSinceLastLog = Math.floor(
    (now.getTime() - lastLogDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysSinceLastLog <= dayThreshold;
}

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 90] as const;

export function getNextStreakMilestone(currentStreak: number): number {
  return STREAK_MILESTONES.find((m) => m > currentStreak) ?? 90;
}
