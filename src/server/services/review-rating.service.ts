import { db } from "@/server/db";

export class RatingError extends Error {}

/**
 * Leave a 1–5 star rating for another user tied to a task. Upserts (one rating
 * per author/target/task) and recomputes the target's cached average.
 */
export async function leaveReview(params: {
  authorId: string;
  targetId: string;
  taskId: string;
  rating: number;
  comment?: string;
}) {
  if (params.rating < 1 || params.rating > 5) {
    throw new RatingError("Rating must be between 1 and 5");
  }
  if (params.authorId === params.targetId) {
    throw new RatingError("You cannot review yourself");
  }

  await db.review.upsert({
    where: {
      taskId_authorId_targetId: {
        taskId: params.taskId,
        authorId: params.authorId,
        targetId: params.targetId,
      },
    },
    update: { rating: params.rating, comment: params.comment },
    create: {
      taskId: params.taskId,
      authorId: params.authorId,
      targetId: params.targetId,
      rating: params.rating,
      comment: params.comment,
    },
  });

  await recomputeRating(params.targetId);
}

export async function recomputeRating(userId: string) {
  const agg = await db.review.aggregate({
    where: { targetId: userId },
    _avg: { rating: true },
    _count: true,
  });
  await db.user.update({
    where: { id: userId },
    data: {
      ratingAvg: agg._avg.rating ?? 0,
      ratingCount: agg._count,
    },
  });
}
