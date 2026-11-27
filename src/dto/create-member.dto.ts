import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

//컨트롤러에서 이 DTO를 사용하면 검사가 실행됨.
export class CreateMemberDto {
  @ApiProperty({ description: '로그인에 사용할 이메일', example: 'challenger@umc.com' })
  @IsEmail({}, { message: "올바른 이메일 형식이 아닙니다." })
  email!: string; //이메일이라는 필드의 값이 이메일인지를 검사한다.

  @ApiProperty({
    description: '대문자/소문자/숫자/특수문자를 포함한 8자 이상',
    example: 'Umc1234!',
  })
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/, {
    message:
      "비밀번호는 대문자/소문자/숫자/특수문자를 포함한 8자 이상이어야 합니다.",
  })
  password!: string;

  
  @ApiProperty({ description: '2자 이상 12자 이하의 닉네임', example: '영화조아' })
  @IsString()
  @IsNotEmpty({ message: '닉네임을 입력해주세요.' })
  @MinLength(2, { message: '닉네임은 2자 이상이어야 합니다.' })
  @MaxLength(12, { message: '닉네임은 12자 이하여야 합니다.' })
  nickname!: string;

}
