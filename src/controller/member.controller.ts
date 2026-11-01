import { Controller, Get, Param } from '@nestjs/common';
import { MemberService } from '../service/member.service.js';
import type { CheckResponseDto } from '../dto/check-response.dto.js';

@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  // GET /members/nickname/수현 → { "available": false }
  @Get('nickname/:nickname')
  checkNickname(@Param('nickname') nickname: string): Promise<CheckResponseDto> {
    return this.memberService.checkNickname(nickname);
  }

  @Get('email/:email')
  checkEmail(@Param('email') email: string): Promise<CheckResponseDto> {
    return this.memberService.checkEmail(email);
  }
}
