// src/controller/favorite.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../guard/auth.guard.js";
import type { AuthRequest } from "../guard/auth.guard.js";
import { FavoriteService } from "../service/favorite.service.js";
import { CreateFavoriteDto } from "../dto/favorite/create-favorite.dto.js";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags('즐겨찾기')
@ApiBearerAuth('bearerAuth')
@Controller("favorites")
@UseGuards(AuthGuard)
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}
  @ApiOperation({
    summary: '즐겨찾기 등록',
    description: '토큰의 주인인 회원이 TMDB 영화 ID 하나를 즐겨찾기에 추가합니다.',
  })
  // NestJS는 컨트롤러가 돌려주는 객체의 모양을 실행 중에 알 수 없어서, 응답 예시를 직접 적어줍니다.
  @ApiResponse({
    status: 201,
    description: '즐겨찾기 등록 성공',
    schema: {
      example: {
        isSuccess: true,
        code: 'COMMON201',
        message: '즐겨찾기를 등록했습니다.',
        result: { favoriteId: 1, movieId: 550, createdAt: '2026-09-13T21:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '토큰이 없거나 유효하지 않음',
    schema: {
      example: {
        isSuccess: false,
        code: 'AUTH401_2',
        message: '로그인이 필요한 요청입니다.',
        result: null,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: '이미 즐겨찾기한 영화',
    schema: {
      example: {
        isSuccess: false,
        code: 'FAVORITE409_1',
        message: '이미 이 영화를 즐겨찾기하셨습니다.',
        result: null,
      },
    },
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() request: AuthRequest, @Body() dto: CreateFavoriteDto) {
    const memberId = request["memberId"] as number;
    const result = await this.favoriteService.create(memberId, dto);

    return {
      isSuccess: true,
      code: "COMMON201",
      message: "즐겨찾기를 등록했습니다.",
      result,
    };
  }

  @ApiOperation({ summary: '내 즐겨찾기 목록 조회' })
  @ApiResponse({ status: 401, description: 'AUTH401_2: 토큰 없음 / AUTH401_3: 유효하지 않은 토큰 / AUTH401_4: 만료' })
  @Get()
  @HttpCode(HttpStatus.OK)
  async getMyFavorites(@Req() request: AuthRequest) {
    const memberId = request["memberId"] as number;
    const result = await this.favoriteService.getMyFavorites(memberId);

    return {
      isSuccess: true,
      code: "COMMON200",
      message: "내 즐겨찾기 목록을 조회했습니다.",
      result,
    };
  }

  @ApiOperation({ summary: '영화 즐겨찾기 여부 조회' })
  @ApiResponse({ status: 401, description: 'AUTH401_2: 토큰 없음 / AUTH401_3: 유효하지 않은 토큰 / AUTH401_4: 만료' })
  @Get(":movieId")
  @HttpCode(HttpStatus.OK)
  async getStatus(
    @Req() request: AuthRequest,
    @Param("movieId", ParseIntPipe) movieId: number
  ) {
    const memberId = request["memberId"] as number;
    const result = await this.favoriteService.getStatus(memberId, movieId);

    return {
      isSuccess: true,
      code: "COMMON200",
      message: "즐겨찾기 여부를 조회했습니다.",
      result,
    };
  }

  @ApiOperation({ summary: '즐겨찾기 해제' })
  @ApiResponse({ status: 401, description: 'AUTH401_2: 토큰 없음 / AUTH401_3: 유효하지 않은 토큰 / AUTH401_4: 만료' })
  @ApiResponse({ status: 404, description: 'FAVORITE404_1: 즐겨찾기하지 않은 영화' })
  @Delete(":movieId")
  @HttpCode(HttpStatus.OK)
  async delete(
    @Req() request: AuthRequest,
    @Param("movieId", ParseIntPipe) movieId: number
  ) {
    const memberId = request["memberId"] as number;
    await this.favoriteService.delete(memberId, movieId);

    return {
      isSuccess: true,
      code: "COMMON200",
      message: "즐겨찾기를 해제했습니다.",
      result: null,
    };
  }
}
