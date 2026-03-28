const regexCache = new Map<string, RegExp>();

export function matchesEventPattern(eventType: string, pattern: string): boolean {
  let regex = regexCache.get(pattern);
  if (!regex) {
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*');
    regex = new RegExp(`^${escaped}$`);
    regexCache.set(pattern, regex);
  }
  return regex.test(eventType);
}

export function clearPatternCache(): void {
  regexCache.clear();
}
