/**
 * Statistical engine for orthopedic research.
 * Provides descriptive and inferential statistics.
 */

export function descriptiveStats(data: number[]) {
  if (data.length === 0) return null;
  const sorted = [...data].sort((a, b) => a - b);
  const sum = data.reduce((a, b) => a + b, 0);
  const mean = sum / data.length;
  const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (data.length - 1);
  const sd = Math.sqrt(variance);
  
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const median = sorted[Math.floor(sorted.length * 0.5)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  
  return {
    mean,
    sd,
    median,
    q1,
    q3,
    iqr: q3 - q1,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    n: data.length
  };
}

export function categoricalStats(data: any[]) {
  const counts: Record<string, number> = {};
  data.forEach(val => {
    const key = String(val);
    counts[key] = (counts[key] || 0) + 1;
  });
  
  const total = data.length;
  const results = Object.entries(counts).map(([label, count]) => ({
    label,
    count,
    percentage: (count / total) * 100
  }));
  
  return { results, total };
}

// Simplified statistical tests (placeholders for real implementations if needed)
export function tTestIndependent(groupA: number[], groupB: number[]) {
  // Simplified Welch's t-test logic
  const statsA = descriptiveStats(groupA);
  const statsB = descriptiveStats(groupB);
  if (!statsA || !statsB) return null;
  
  const t = (statsA.mean - statsB.mean) / Math.sqrt((statsA.sd**2 / statsA.n) + (statsB.sd**2 / statsB.n));
  // p-value estimation (very rough)
  const p = Math.exp(-0.717 * Math.abs(t) - 0.416 * Math.pow(t, 2)); 
  
  const cohenD = (statsA.mean - statsB.mean) / Math.sqrt((statsA.sd**2 + statsB.sd**2) / 2);
  
  return { t, p, cohenD };
}

export function chiSquareTest(observed: number[][]) {
  // Simplified Chi-square logic
  return { p: 0.05, cramerV: 0.2 }; // Placeholder
}
