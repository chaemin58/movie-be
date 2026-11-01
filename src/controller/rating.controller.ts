import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RatingService } from '../service/rating.service.js';

//controller의 기본 경로 지정
@Controller('members')
export class RatingController {
  //생성자를 통해서 service 연결. Nest가 Service 객체를 만들어서 넣어준다.

  constructor(private readonly ratingService: RatingService) {}
  @Get(':memberId/ratings')
  //URL에 있는 값을 memberId에 넣기 위한 코드.
  //memberId를 ParseIntPipe를 사용해서 number로 바꾸어서 넣어준다.
  getMemberRatings(@Param('memberId', ParseIntPipe) memberId: number) {
    //그리고 그걸 다시 service 코드를 호출해서 넣어줌.
    return this.ratingService.getRatingsByMember(memberId);
  }
}
