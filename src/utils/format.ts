export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function safePercent(value: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}
