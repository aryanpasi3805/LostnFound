export const calculateMatch = (item, candidate) => {
  let score = 0;

  if (item.category === candidate.category) score += 30;
  if (item.location === candidate.location) score += 25;

  const dateDiff = Math.abs(new Date(item.date) - new Date(candidate.date)) / (1000 * 60 * 60 * 24);
  if (dateDiff <= 3) score += 20;
  else if (dateDiff <= 7) score += 10;

  if (item.description && candidate.description &&
      item.description.split(" ").some(word => candidate.description.includes(word)))
    score += 15;

  if (item.identifiers?.color === candidate.identifiers?.color) score += 10;

  return score;
};