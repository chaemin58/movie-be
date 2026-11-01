import type { INestApplication } from '@nestjs/common';

export function configureCors(app: INestApplication, enabled = true): void {
  if (enabled) {
    // 브라우저가 이 출처의 화면에서 API 응답을 읽을 수 있도록 허용합니다.
    app.enableCors({
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    });
  }
}
