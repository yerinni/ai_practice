export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

const MOOD_POOL_BY_TIME: Record<TimeOfDay, string[]> = {
  morning: ['경쾌한', '신나는'],
  afternoon: ['신나는', '경쾌한'],
  evening: ['차분한', '센치한'],
  night: ['몽환적인', '센치한'],
};

const TIME_OF_DAY_LABEL: Record<TimeOfDay, string> = {
  morning: '상쾌한 아침',
  afternoon: '활기찬 오후',
  evening: '차분한 저녁',
  night: '고요한 밤',
};

export function timeOfDayLabel(timeOfDay: TimeOfDay): string {
  return TIME_OF_DAY_LABEL[timeOfDay];
}

// F3/F4: picks a mood tag without asking the user anything. Prefers the
// traveler's own mood_preferences (from trip-setup) where they overlap with
// what fits the current time of day, falls back to the time-of-day pool,
// and finally to whatever mood_preferences they picked. `exclude` is used by
// "다른 느낌으로" so it doesn't just re-suggest the same mood.
export function pickMoodTag(options: { timeOfDay: TimeOfDay; tripMoodPreferences: string[]; exclude?: string }): string {
  const { timeOfDay, tripMoodPreferences, exclude } = options;
  const timePool = MOOD_POOL_BY_TIME[timeOfDay];
  const overlap = tripMoodPreferences.filter((mood) => timePool.includes(mood));
  const base = overlap.length > 0 ? overlap : timePool.length > 0 ? timePool : tripMoodPreferences;
  const candidates = base.filter((mood) => mood !== exclude);
  const pool = candidates.length > 0 ? candidates : base.length > 0 ? base : timePool;
  return pool[Math.floor(Math.random() * pool.length)] ?? '차분한';
}
