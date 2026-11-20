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

@Controller("favorites")
@UseGuards(AuthGuard)
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

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
