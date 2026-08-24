export function normalizeLikert(answer: number): number {
  if (!Number.isInteger(answer) || answer < 1 || answer > 7) {
    throw new Error(`Invalid Likert answer: ${answer}`);
  }
  return ((answer - 1) / 6) * 100;
}

export function scoreLikert(answer: number, reverse = false): number {
  const keyed = reverse ? 8 - answer : answer;
  return normalizeLikert(keyed);
}
