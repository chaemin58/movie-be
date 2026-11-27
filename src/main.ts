import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module.js";
import { configureCors } from "./cors.js";
import { HttpExceptionFilter } from "./filter/http-exception.filter.js";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder().setTitle('영화 평점 서비스 API').setDescription('UMC 11기 백엔드 워크북으로 만든 회원/평점/즐겨찾기 API 문서입니다.').setVersion('v1').addBearerAuth({type:'http', scheme:'bearer', bearerFormat:'JWT'}, 'bearerAuth',).build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger-ui', app, document);

  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  // 기본 실행은 CORS를 켭니다. --no-cors는 워크북의 설정 전/후 비교용입니다.
  configureCors(app, !process.argv.includes("--no-cors"));
  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, "localhost");
  console.log(`영화 평점 API: http://localhost:${port}`);
}

bootstrap().catch((error: unknown) => {
  console.error("서버를 실행하지 못했습니다.", error);
  process.exitCode = 1;
});
