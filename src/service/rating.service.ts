import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Rating } from "../entity/rating.entity.js";
import { Member } from "../entity/member.entity.js";
import { RatingResponseDto } from "../dto/rating-response.dto.js";
import { CreateRatingDto } from "../dto/create-rating.dto.js";
import { UpdateRatingDto } from "../dto/update-rating.dto.js";
import { ApiException } from "../exception/api.exception.js";

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    //회원이 있는지 검사해야하기 때문에 연결해줌
    @InjectRepository(Member)
    private readonly memberRepositoty: Repository<Member>
  ) {}
  async getRatingsByMember(memberId: number): Promise<RatingResponseDto[]> {
    const exists = await this.memberRepositoty.exists({ where: { memberId } });
    if (!exists) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        "MEMBER404_1",
        "해당 회원을 찾을 수 없습니다."
      );
    }

    const ratings = await this.ratingRepository.find({
      where: { member: { memberId } },
      order: { ratingId: "DESC" },
    });

    return ratings.map(RatingResponseDto.from);
  }

  async create(
    memberId: number,
    dto: CreateRatingDto
  ): Promise<RatingResponseDto> {
    const member = await this.memberRepositoty.findOneBy({ memberId });

    if (!member) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        "MEMBER404_1",
        "해당 회원을 찾을 수 없습니다."
      );
    }

    //이 유저가 이 영화에 평점을 남겼는지 확인함. DB에서도 막히지만 알맞은 에러 메세지를 내려주기 위해서 서버에서 검사
    const existing = await this.ratingRepository.findOne({
      where: { member: { memberId }, movieId: dto.movieId },
    });

    if (existing) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        "MEMBER409_1",
        "이미 이 영화에 평점을 남기셨습니다."
      );
    }

    const saved = await this.ratingRepository.save(
      this.ratingRepository.create({
        member,
        movieId: dto.movieId,
        score: dto.score,
        comment: dto.comment,
      })
    );

    return RatingResponseDto.from(saved);
  }

  //누가 어떤 코멘트를 어떻게 수정할 건지를 보내야한다.
  async update(
    memberId: number,
    ratingId: number,
    dto: UpdateRatingDto
  ): Promise<RatingResponseDto> {
    //먼저 코멘트를 조회해준다. -- 수정할 권한이 있는지
    const rating = await this.findOwnedRating(ratingId, memberId);

    //수정을 해준다.
    rating.score = dto.score;
    rating.comment = dto.comment ?? null;

    const saved = await this.ratingRepository.save(rating);

    return RatingResponseDto.from(saved);
  }

  async delete(memberId: number, ratingId: number): Promise<void> {
    //우선 삭제할 권한이 있는지를 확인해야할 것 같다.
    const rating = await this.findOwnedRating(ratingId, memberId);
    await this.ratingRepository.remove(rating);
  }

  //평점이 요청자의 것인지 확인해준다.
  //1. 평점이 있는지를 찾아보는 것이 우선이고, 2. 평점이 있다면 누가 주인인지를 확인한다.
  private async findOwnedRating(
    ratingId: number,
    memberId: number
  ): Promise<Rating> {
    const rating = await this.ratingRepository.findOne({
      where: { ratingId },
      relations: { member: true },
    });

    if (!rating) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        "RATING404_1",
        "해당 평점을 찾을 수 없습니다."
      );
    }

    if (rating.member.memberId !== memberId) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        "RATING403_1",
        "본인이 작성한 평점만 수정하거나 삭제할 수 있습니다."
      );
    }
    return rating;
  }
}
