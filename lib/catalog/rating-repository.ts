import { execute, query } from "@/lib/db/pool";
import { getPromptById } from "@/lib/catalog/prompt-repository";
import type { ApiUser } from "@/lib/api/auth";

export type RatingFeedbackStatus = {
  pending: boolean;
  hasCopied: boolean;
  myStars: number | null;
};

export async function getRatingFeedbackStatus(
  promptId: string,
  userId: string
): Promise<RatingFeedbackStatus> {
  const copyRows = await query<{ prompt_id: string }[]>(
    `SELECT prompt_id FROM prompt_copies
     WHERE user_id = :userId AND prompt_id = :promptId
     LIMIT 1`,
    { userId, promptId }
  );
  const hasCopied = Boolean(copyRows[0]);

  const ratingRows = await query<{ stars: number }[]>(
    `SELECT stars FROM prompt_ratings
     WHERE user_id = :userId AND prompt_id = :promptId
     LIMIT 1`,
    { userId, promptId }
  );
  const myStars = ratingRows[0] ? Number(ratingRows[0].stars) : null;

  return {
    hasCopied,
    myStars,
    pending: hasCopied && myStars === null,
  };
}

async function refreshPromptRatingCache(promptId: string) {
  await query(
    `UPDATE prompts p
     SET
       rating_avg = COALESCE((
         SELECT AVG(stars) FROM prompt_ratings WHERE prompt_id = p.id
       ), 0),
       rating_count = (
         SELECT COUNT(*) FROM prompt_ratings WHERE prompt_id = p.id
       )
     WHERE p.id = :promptId`,
    { promptId }
  );
}

export async function upsertPromptRating(
  promptId: string,
  user: ApiUser,
  stars: number
) {
  const prompt = await getPromptById(promptId, user);
  if (!prompt) {
    return { status: "not_found" as const };
  }

  const copyRows = await query<{ prompt_id: string }[]>(
    `SELECT prompt_id FROM prompt_copies
     WHERE user_id = :userId AND prompt_id = :promptId
     LIMIT 1`,
    { userId: user.id, promptId }
  );
  if (!copyRows[0]) {
    return { status: "not_copied" as const };
  }

  await execute(
    `INSERT INTO prompt_ratings (user_id, prompt_id, stars)
     VALUES (:userId, :promptId, :stars)
     ON DUPLICATE KEY UPDATE stars = VALUES(stars)`,
    { userId: user.id, promptId, stars }
  );

  await refreshPromptRatingCache(promptId);
  const updated = await getPromptById(promptId, user);

  return {
    status: "ok" as const,
    stars,
    prompt: updated,
  };
}
