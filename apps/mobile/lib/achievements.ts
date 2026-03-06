import { Workout } from '@/context/WorkoutContext';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  unlocked: boolean;
}

const weekStart = (date: Date): string => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Sunday
  return d.toISOString().slice(0, 10);
};

export const computeStreak = (history: Workout[]): number => {
  if (history.length === 0) return 0;
  const days = new Set(history.map(w => new Date(w.date).toISOString().slice(0, 10)));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);
  const yestStr = new Date(today.getTime() - 86400000).toISOString().slice(0, 10);
  // Grace period: streak counts if trained today or yesterday
  if (!days.has(todayStr) && !days.has(yestStr)) return 0;
  let cur = new Date(days.has(todayStr) ? today : today.getTime() - 86400000);
  let streak = 0;
  while (days.has(cur.toISOString().slice(0, 10))) {
    streak++;
    cur = new Date(cur.getTime() - 86400000);
  }
  return streak;
};

export const getAchievements = (history: Workout[]): Achievement[] => {
  const total = history.length;

  const totalVolume = history.reduce((acc, w) =>
    acc + w.exercises.reduce((ea, ex) =>
      ea + ex.sets.reduce((sa, s) => {
        if (!s.completed) return sa;
        return sa + (parseFloat(s.weight) || 0) * (parseFloat(s.reps) || 0);
      }, 0), 0), 0);

  const maxDuration = history.reduce((max, w) => Math.max(max, w.duration), 0);

  const weekCounts: Record<string, number> = {};
  history.forEach(w => {
    const k = weekStart(new Date(w.date));
    weekCounts[k] = (weekCounts[k] || 0) + 1;
  });
  const maxWeekCount = Math.max(0, ...Object.values(weekCounts));

  const streak = computeStreak(history);

  return [
    {
      id: 'first',
      title: 'MONSTRO NASCEU',
      description: 'Completou o primeiro treino',
      emoji: '🥊',
      color: '#00FF88',
      unlocked: total >= 1,
    },
    {
      id: 'ten',
      title: 'DEDICADO',
      description: '10 treinos completados',
      emoji: '💪',
      color: '#06B6D4',
      unlocked: total >= 10,
    },
    {
      id: 'fifty',
      title: 'LEÃO',
      description: '50 treinos completados',
      emoji: '🦁',
      color: '#F59E0B',
      unlocked: total >= 50,
    },
    {
      id: 'hundred',
      title: 'CENTURIÃO',
      description: '100 treinos completados',
      emoji: '🏆',
      color: '#FF2D55',
      unlocked: total >= 100,
    },
    {
      id: 'week3',
      title: 'SEMANA EM CHAMAS',
      description: '3 treinos numa semana',
      emoji: '🔥',
      color: '#F59E0B',
      unlocked: maxWeekCount >= 3,
    },
    {
      id: 'week5',
      title: 'MODO MONSTRO',
      description: '5 treinos numa semana',
      emoji: '👹',
      color: '#7C3AED',
      unlocked: maxWeekCount >= 5,
    },
    {
      id: 'streak7',
      title: '7 DIAS SEGUIDOS',
      description: '7 dias consecutivos treinando',
      emoji: '⚡',
      color: '#7C3AED',
      unlocked: streak >= 7,
    },
    {
      id: 'marathon',
      title: 'MARATONA',
      description: 'Treino acima de 90 minutos',
      emoji: '🎯',
      color: '#06B6D4',
      unlocked: maxDuration >= 5400,
    },
    {
      id: 'volume10k',
      title: 'VOLUME MONSTRO',
      description: '10.000kg de volume total',
      emoji: '🏋️',
      color: '#00FF88',
      unlocked: totalVolume >= 10000,
    },
    {
      id: 'volume100k',
      title: 'KING DO GYM',
      description: '100.000kg de volume total',
      emoji: '👑',
      color: '#F59E0B',
      unlocked: totalVolume >= 100000,
    },
  ];
};
