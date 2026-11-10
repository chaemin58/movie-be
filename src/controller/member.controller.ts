import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from "@nestjs/common";
import { MemberService } from "../service/member.service.js";
import type { CheckResponseDto } from "../dto/check-response.dto.js";
import { CreateMemberDto } from "../dto/create-member.dto.js";

@Controller("members")
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  // GET /members/nickname/수현 → { "available": false }
  @Get("nickname/:nickname")
  checkNickname(
    @Param("nickname") nickname: string,
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
