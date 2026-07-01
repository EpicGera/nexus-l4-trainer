import { useState, useMemo } from "react";
import { WORKOUT_DATABASE } from "../data/workouts";

export function useWorkoutState() {
  const [currentWeek, setCurrentWeek] = useState<string>(() => {
    return "week_1";
  });

  const [currentDayIndex, setCurrentDayIndex] = useState<number>(() => {
    return 0;
  });

  const currentProgramWeek = useMemo(
    () => WORKOUT_DATABASE.weeks && Array.isArray(WORKOUT_DATABASE.weeks) ? WORKOUT_DATABASE.weeks.find((w: any) => w.id === currentWeek) : Object.values(WORKOUT_DATABASE.weeks).find((w: any) => w.id === currentWeek),
    [currentWeek]
  );

  const activeDayId = useMemo(() => {
    if (!currentProgramWeek) return null;
    return currentProgramWeek.days[currentDayIndex]?.id;
  }, [currentProgramWeek, currentDayIndex]);

  const getDayReward = (dayId: string) => {
    return { item: "Reward", xp: 100 };
  };

  return {
    currentWeek, setCurrentWeek,
    currentDayIndex, setCurrentDayIndex,
    currentProgramWeek, activeDayId, getDayReward
  };
}
