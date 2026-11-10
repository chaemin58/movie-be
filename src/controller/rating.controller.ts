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
  Req,
  UseGuards,
} from "@nestjs/common";
import { RatingService } from "../service/rating.service.js";
import { CreateRatingDto } from "../dto/create-rating.dto.js";
import { UpdateRatingDto } from "../dto/update-rating.dto.js";
import { AuthGuard, AuthRequest } from "../guard/auth.guard.js";
import { Auth } from "typeorm/driver/mongodb/typings.js";

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

  @Post("ratings")
  //요청이 정상 처리됏을 때 보낼 HTTP 상태코드를 지정하는 데코레이터 - 생략해도 무방하다
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() request: AuthRequest, @Body() dto: CreateRatingDto) {
    const memberId = request["memberId"] as number;
    const result = await this.ratingService.create(memberId, dto);
    return {
      isSuccess: true,
      code: "COMMON201",
      message: "평점 등록에 성공했습니다.",
      result,
    };
  }

  @Patch("ratings/:ratingId")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @Req() request: AuthRequest,
    @Param("ratingId", ParseIntPipe) ratingId: number,
    @Body() dto: UpdateRatingDto
  ) {
    const memberId = request["memberId"] as number;

    const result = await this.ratingService.update(memberId, ratingId, dto);
    return {
      isSuccess: true,
      code: "COMMON200",
      message: "평점을 수정했습니다.",
      result,
    };
  }

  @Delete("ratings/:ratingId")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async delete(
    @Req() request: AuthRequest,
    @Param("ratingId", ParseIntPipe) ratingId: number
  ) {
    const memberId = request["memberId"] as number;

    await this.ratingService.delete(memberId, ratingId);
    return {
      isSuccess: true,
      code: "COMMON200",
      message: "평점을 삭제했습니다.",
      result: null,
    };
  }
}
