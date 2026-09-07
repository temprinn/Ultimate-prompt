/** Bayesian prior for popular sort (App Store–style smoothing). */
export const RATING_PRIOR_MEAN = 3.5;
export const RATING_PRIOR_WEIGHT = 4;

export function bayesianScore(ratingAvg: number, ratingCount: number) {
  if (ratingCount <= 0) {
    return 0;
  }

  return (
    (RATING_PRIOR_WEIGHT * RATING_PRIOR_MEAN + ratingAvg * ratingCount) /
    (RATING_PRIOR_WEIGHT + ratingCount)
  );
}

export function popularSortSql() {
  const prior = RATING_PRIOR_MEAN;
  const weight = RATING_PRIOR_WEIGHT;
  return `
    CASE
      WHEN p.rating_count > 0 THEN
        ((${weight} * ${prior}) + (p.rating_avg * p.rating_count))
        / (${weight} + p.rating_count)
      ELSE 0
    END DESC,
    p.usage_count DESC,
    p.created_at DESC
  `;
}
