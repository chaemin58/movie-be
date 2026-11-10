import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { MemberService } from "../service/member.service.js";
import type { CheckResponseDto } from "../dto/check-response.dto.js";
import { CreateMemberDto } from "../dto/create-member.dto.js";
import { AuthGuard } from "../guard/auth.guard.js";
import type { Request } from "express";

type AuthRequest = Request & { memberId?: number };

@Controller("members")
export class MemberController {
  constructor(private readonly memberService: MemberService) {}
  @Get("me")
  @UseGuards(AuthGuard) // 이 줄이 없으면 토큰 없이도 호출됩니다
  async getMyInfo(@Req() request: AuthRequest) {
    // Guard가 request["memberId"]에 담아둔 값을 꺼냅니다
    const memberId = request.memberId as number;

    const result = await this.memberService.getMyInfo(memberId);
    return {
      isSuccess: true,
      code: "COMMON200",
      message: "회원 정보를 조회했습니다.",
      result,
    };
  }

  // GET /members/nickname/수현 → { "available": false }
  @Get("nickname/:nickname")
  checkNickname(
    @Param("nickname") nickname: string
  ): Promise<CheckResponseDto> {
    return this.memberService.checkNickname(nickname);
  }

  @Get("email/:email")
  checkEmail(@Param("email") email: string): Promise<CheckResponseDto> {
    return this.memberService.checkEmail(email);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() dto: CreateMemberDto) {
    const result = await this.memberService.signUp(dto);
    return {
      isSuccess: true,
      code: "COMMON201",
      message: "회원가입에 성공했습니다.",
      result,
    };
  }
}
