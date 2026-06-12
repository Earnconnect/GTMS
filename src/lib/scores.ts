export function computeAccuracy(approved: number, rejected: number): number {
  const total = approved + rejected;
  if (total === 0) return 50; // neutral default for new workers
  return Math.round((approved / total) * 100 * 10) / 10;
}

export function computeSpeed(workerMs: number, medianMs: number): number {
  if (medianMs === 0 || workerMs === 0) return 50;
  const ratio = medianMs / workerMs;
  const clamped = Math.max(0.1, Math.min(3.0, ratio));
  return Math.round(((clamped - 0.1) / (3.0 - 0.1)) * 100 * 10) / 10;
}

export function computeConsistency(accuracyValues: number[]): number {
  if (accuracyValues.length < 2) return 50;
  const mean = accuracyValues.reduce((a, b) => a + b, 0) / accuracyValues.length;
  const variance = accuracyValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / accuracyValues.length;
  const stdDev = Math.sqrt(variance);
  return Math.max(0, Math.min(100, 100 - stdDev * 2));
}

export function computeTrust(
  accuracy: number,
  speed: number,
  consistency: number,
  accountAgeDays: number
): number {
  const tenureBonus = Math.min(100, accountAgeDays / 3);
  return Math.round(
    (accuracy * 0.5 + speed * 0.2 + consistency * 0.2 + tenureBonus * 0.1) * 10
  ) / 10;
}
