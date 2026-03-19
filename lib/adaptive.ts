// lib/adaptive.ts

export function calculateNewLevel(
  currentLevel: number,
  lastAnswers: { isCorrect: boolean }[]
): number {
  if (lastAnswers.length < 5) return currentLevel;

  const correctCount = lastAnswers.filter(a => a.isCorrect).length;
  const percentage = (correctCount / lastAnswers.length) * 100;

  if (percentage > 70 && currentLevel < 5) return currentLevel + 1;
  if (percentage < 40 && currentLevel > 1) return currentLevel - 1;
  return currentLevel;
}

export function calculatePercentage(
  answers: { isCorrect: boolean }[]
): number {
  if (answers.length === 0) return 0;
  const correct = answers.filter(a => a.isCorrect).length;
  return Math.round((correct / answers.length) * 100);
}