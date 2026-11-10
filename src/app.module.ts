import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Member } from "./entity/member.entity.js";
import { Rating } from "./entity/rating.entity.js";
import { MemberController } from "./controller/member.controller.js";
import { RatingController } from "./controller/rating.controller.js";
import { MemberService } from "./service/member.service.js";
import { RatingService } from "./service/rating.service.js";

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true, // 전역 등록해두면 어느 서비스에서든 JwtService를 주입받을 수 있습니다
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: {
          // 초 단위 숫자로 넘깁니다. 환경변수는 문자열로 들어오므로 Number()로 바꿔주세요.
          expiresIn: Number(
            configService.get<string>("JWT_ACCESS_EXPIRATION") ?? 3600
          ),
        },
      }),
    }),
    // movie/.env의 값을 읽고 다른 클래스에서도 사용할 수 있게 합니다.
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "mysql" as const,
        host: config.getOrThrow<string>("DB_HOST"),
        port: Number(config.get<string>("DB_PORT", "3306")),
        username: config.getOrThrow<string>("DB_USER"),
        password: config.getOrThrow<string>("DB_PASSWORD"),
        database: config.getOrThrow<string>("DB_NAME"),
        autoLoadEntities: true,
        // 테이블은 sql/schema.sql로 만듭니다. 실행 때 자동 변경하지 않습니다.
        synchronize: false,
        charset: "utf8mb4",
        timezone: "Z",
        supportBigNumbers: true,
        bigNumberStrings: false,
        retryAttempts: 1,
      }),
    }),
    // 이 등록으로 Repository<Member>, Repository<Rating>을 주입할 수 있습니다.
    TypeOrmModule.forFeature([Member, Rating]),
  ],
  controllers: [MemberController, RatingController],
  providers: [MemberService, RatingService],
})
export class AppModule {}
