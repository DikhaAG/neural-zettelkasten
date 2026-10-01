/**
 * Generates deterministic, vibrant neon / pastel colors for any dynamic cluster name.
 */
const PRESET_COLORS = [
  '#06b6d4', // Neon Cyan
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ec4899', // Pink / Magenta
  '#3b82f6', // Electric Blue
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#a855f7', // Purple
  '#84cc16', // Lime
];

export function getClusterColor(clusterName: string): string {
  if (!clusterName) return '#94a3b8';

  let hash = 0;
  for (let i = 0; i < clusterName.length; i++) {
    hash = clusterName.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % PRESET_COLORS.length;
  return PRESET_COLORS[index];
}
