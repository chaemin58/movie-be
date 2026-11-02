import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { RatingService } from "../service/rating.service.js";
import { CreateRatingDto } from "../dto/create-rating.dto.js";
import { UpdateRatingDto } from "../dto/update-rating.dto.js";

//controller의 기본 경로 지정
@Controller("members")
export class RatingController {
  //생성자를 통해서 service 연결. Nest가 Service 객체를 만들어서 넣어준다.

  constructor(private readonly ratingService: RatingService) {}
  @Get(":memberId/ratings")
  @HttpCode(HttpStatus.OK)
  //URL에 있는 값을 memberId에 넣기 위한 코드.
  //memberId를 ParseIntPipe를 사용해서 number로 바꾸어서 넣어준다.
  getMemberRatings(@Param("memberId", ParseIntPipe) memberId: number) {
    //그리고 그걸 다시 service 코드를 호출해서 넣어줌.
    return this.ratingService.getRatingsByMember(memberId);
  }

  @Post(":memberId/ratings")
  //요청이 정상 처리됏을 때 보낼 HTTP 상태코드를 지정하는 데코레이터 - 생략해도 무방하다
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param("memberId", ParseIntPipe) memberId: number,
    //클라이언트가 서버로 보낸 요청 본문을 받는 부분
    @Body() dto: CreateRatingDto
  ) {
    //memberId와 본문을 가지고 create 한다.
    const ratingId = await this.ratingService.create(memberId, dto);
    return {
      isSuccess: true,
      code: "COMMON201",
      message: "평점 등록에 성공했습니다.",
      result: ratingId,
    };
  }

  @Patch(":memberId/ratings/:ratingId")
  async update(
    @Param("memberId", ParseIntPipe) memberId: number,
    @Param("ratingId", ParseIntPipe) ratingId: number,

    @Body() dto: UpdateRatingDto
  ) {
    await this.ratingService.update(ratingId, memberId, dto);
    return {
      isSucccess: true,
      code: "COMMON200",
      message: "평점 수정에 성공했습니다.",
      result: null,
    };
  }

  @Delete(":memberId/ratings/:ratingId")
  async delete(
    @Param("memberId", ParseIntPipe) memberId: number,
    @Param("ratingId", ParseIntPipe) ratingId: number
  ) {
    await this.ratingService.delete(ratingId, memberId);
  }
}
