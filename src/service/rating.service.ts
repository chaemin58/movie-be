import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from '../entity/rating.entity.js';
import { Member } from '../entity/member.entity.js';
import { RatingResponseDto } from '../dto/rating-response.dto.js';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    //회원이 있는지 검사해야하기 ㅇ때문에 연결해줌
    @InjectRepository(Member)
    private readonly memberRepositoty: Repository<Member>,
  ) {}
  async getRatingsByMember(memberId: number): Promise<RatingResponseDto[]> {
    const exists = await this.memberRepositoty.exists({ where: { memberId } });
    if (!exists) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    const ratings = await this.ratingRepository.find({
      where: { member: { memberId } },
      order: { ratingId: 'DESC' },
    });

    return ratings.map(RatingResponseDto.from);
  }
}
