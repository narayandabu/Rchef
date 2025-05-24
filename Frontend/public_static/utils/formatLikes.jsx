// utils/formatLikes.js
export function formatLikeCount(count) {
  if (typeof count !== 'number') return '0';
  if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + 'M';
  if (count >= 1_000) return (count / 1_000).toFixed(1) + 'k';
  return count.toString();
}
