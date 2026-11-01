import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureCors } from './cors.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // 기본 실행은 CORS를 켭니다. --no-cors는 워크북의 설정 전/후 비교용입니다.
  configureCors(app, !process.argv.includes('--no-cors'));
  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, 'localhost');
  console.log(`영화 평점 API: http://localhost:${port}`);
}

bootstrap().catch((error: unknown) => {
  console.error('서버를 실행하지 못했습니다.', error);
  process.exitCode = 1;
});
