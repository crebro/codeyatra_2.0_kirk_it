export function parseSSIM(log: string): number {
  const lines = log.trim().split('\n');
  const last = lines[lines.length - 1];
  const match = last.match(/All:(\d+\.\d+)/);
  return match ? parseFloat(match[1]) : 0;
}
