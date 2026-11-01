import type { Rating } from '../entity/rating.entity.js';

export class RatingResponseDto {
  ratingId!: number;
  movieId!: number;
  score!: number;
  comment!: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  // DB 객체에서 API에 필요한 필드만 골라 반환합니다.
  static from(rating: Rating): RatingResponseDto {
    return {
      ratingId: Number(rating.ratingId),
      movieId: Number(rating.movieId),
      score: rating.score,
      comment: rating.comment,
      createdAt: rating.createdAt,
      updatedAt: rating.updatedAt,
    };
  }
}
