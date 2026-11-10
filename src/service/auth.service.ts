import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Member } from "../entity/member.entity.js";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { LoginRequestDto } from "../dto/login-request.dto.js";
import { LoginResponseDto } from "../dto/login-response.dto.js";
import { ApiException } from "../exception/api.exception.js";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    private readonly jwtService: JwtService
  ) {}

  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    //먼저 가입된 이메일인지 확인한다.
    const member = await this.memberRepository.findOne({
      where: { email: dto.email },
      select: { memberId: true, email: true, nickname: true, password: true },
    });

    if (!member) {
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        "AUTH401_1 ",
        "이메일 또는 비밀번호가 올바르지 않습니다." //어디가 잘못되었는지 알려주지 않음.
      );
    }

    //입력한 비밀번호를 저장된 해시와 비교
    const isPasswordMatched = await bcrypt.compare(
      dto.password,
      member.password
    );

    if (!isPasswordMatched) {
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        "AUTH401_1",
        "이메일 또는 비밀번호가 올바르지 않습니다."
      );
    }

    //검증을 통과했으니 토큰 발급
    const accessToken = await this.jwtService.signAsync({
      sub: String(member.memberId),
      email: member.email,
    });

    return {
      nickname: member.nickname,
      accessToken,
    };
  }
}
