import { FavoriteResponseDto } from "./favorite/favorite-response.js";
import { RatingResponseDto } from "./rating-response.dto.js";

export class MovieRecordResponseDto {
  rating!: RatingResponseDto;
  favorite!: FavoriteResponseDto | null;

  static of(
    rating: RatingResponseDto,
    favorite: FavoriteResponseDto | null
  ): MovieRecordResponseDto {
    return { rating, favorite };
  }
}
