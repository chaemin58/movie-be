import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { MemberService } from "../service/member.service.js";
import type { CheckResponseDto } from "../dto/check-response.dto.js";
import { CreateMemberDto } from "../dto/create-member.dto.js";
import { AuthGuard } from "../guard/auth.guard.js";
import type { AuthRequest } from "../guard/auth.guard.js";
import { MemberUpdateRequestDto } from "../dto/member-update.dto.js";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags('회원')
@Controller("members")
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @ApiOperation({
    summary: '내 정보 조회',
    description: '토큰의 회원 정보를 조회합니다.',
  })

  @ApiBearerAuth('bearerAuth')
  @ApiResponse({ status: 401, description: 'AUTH401_2: 토큰 없음 / AUTH401_3: 유효하지 않은 토큰 / AUTH401_4: 만료' })
  @ApiResponse({ status: 404, description: 'MEMBER404_1: 존재하지 않는 회원' })
  @Get("me")
  @UseGuards(AuthGuard) // 이 줄이 없으면 토큰 없이도 호출됩니다
  async getMyInfo(@Req() request: AuthRequest) {
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

  @ApiOperation({ summary: '회원가입', description: '이메일, 비밀번호, 닉네임으로 가입합니다. 토큰이 필요 없는 공개 API입니다.' })
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

  @ApiOperation({ summary: '내 정보 수정' })
  @ApiBearerAuth('bearerAuth')
  @ApiResponse({ status: 401, description: 'AUTH401_2: 토큰 없음 / AUTH401_3: 유효하지 않은 토큰 / AUTH401_4: 만료' })
  @ApiResponse({ status: 404, description: 'MEMBER404_1: 존재하지 않는 회원' })
  @ApiResponse({ status: 409, description: 'MEMBER409_1: 중복 닉네임' })
  @Patch("me")
  @UseGuards(AuthGuard)
  async updateMyInfo(
    @Req() request: AuthRequest,
    @Body() dto: MemberUpdateRequestDto
  ) {
    const memberId = request["memberId"] as number;

    const result = await this.memberService.updateMyInfo(memberId, dto);
    return {
      isSuccess: true,
      code: "COMMON200",
      message: "회원 정보를 수정했습니다.",
      result,
    };
  }
}
