export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

// All 8 mood tags (src/constants/music-taste.ts MOOD_OPTIONS), ordered by
// how well they fit each time of day (best fit first). Keeping every mood
// in every pool — just reordered — means picking several distinct cards
// for one time slot (see pickMoodTags) doesn't run out of options.
const MOOD_POOL_BY_TIME: Record<TimeOfDay, string[]> = {
  morning: ['경쾌한', '신나는', '편안한', '로맨틱한', '차분한', '웅장한', '센치한', '몽환적인'],
  afternoon: ['신나는', '경쾌한', '웅장한', '로맨틱한', '차분한', '편안한', '몽환적인', '센치한'],
  evening: ['차분한', '센치한', '로맨틱한', '편안한', '몽환적인', '웅장한', '경쾌한', '신나는'],
  night: ['몽환적인', '센치한', '편안한', '로맨틱한', '차분한', '웅장한', '신나는', '경쾌한'],
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
// what fits the current time of day, otherwise uses the time-of-day pool.
// `exclude` keeps repeats out — used both by "다른 느낌으로" and by
// pickMoodTags to get several distinct cards at once.
export function pickMoodTag(options: {
  timeOfDay: TimeOfDay;
  tripMoodPreferences: string[];
  exclude?: string[];
}): string {
  const { timeOfDay, tripMoodPreferences, exclude = [] } = options;
  const timePool = MOOD_POOL_BY_TIME[timeOfDay];
  const overlap = timePool.filter((mood) => tripMoodPreferences.includes(mood));
  const preferred = overlap.length > 0 ? overlap : timePool;

  const preferredCandidates = preferred.filter((mood) => !exclude.includes(mood));
  const timePoolCandidates = timePool.filter((mood) => !exclude.includes(mood));
  const pool = preferredCandidates.length > 0 ? preferredCandidates : timePoolCandidates.length > 0 ? timePoolCandidates : timePool;

  return pool[Math.floor(Math.random() * pool.length)];
}

// Picks `count` mood tags for showing several recommendation cards at once,
// each excluding the ones already picked so they don't repeat until the
// pool (8 moods) is exhausted.
export function pickMoodTags(options: { timeOfDay: TimeOfDay; tripMoodPreferences: string[] }, count: number): string[] {
  const picked: string[] = [];
  for (let i = 0; i < count; i++) {
    picked.push(pickMoodTag({ ...options, exclude: picked }));
  }
  return picked;
}
