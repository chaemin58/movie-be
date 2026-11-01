import 'reflect-metadata';
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../dist/app.module.js';
import { configureCors } from '../dist/cors.js';
import { Member } from '../dist/entity/member.entity.js';

// npm run db:init 후 실제 MySQL과 연결해 읽기만 수행하는 통합 테스트입니다.
let app;
let baseUrl;
let source;
before(async () => {
  app = await NestFactory.create(AppModule, { logger: false, abortOnError: false });
  configureCors(app);
  await app.listen(0, '127.0.0.1');
  baseUrl = await app.getUrl();
  source = app.get(DataSource);
});
after(async () => { if (app) await app.close(); });

test('실제 DB의 시드 회원에 대한 닉네임·이메일 중복 확인', async () => {
  for (const path of [`nickname/${encodeURIComponent('수현')}`, 'email/noco%40umc.com']) {
    const response = await fetch(`${baseUrl}/members/${path}`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { available: false });
  }
});

test('실제 DB에서 회원별 필터링·최신순 정렬·응답 필드를 확인한다', async () => {
  const member = await source.getRepository(Member).findOneByOrFail({ email: 'noco@umc.com' });
  const response = await fetch(`${baseUrl}/members/${member.memberId}/ratings`);
  assert.equal(response.status, 200);
  const data = await response.json();
  const rows = await source.query('SELECT rating_id, movie_id, score, comment FROM rating WHERE member_id = ? ORDER BY rating_id DESC', [member.memberId]);
  assert.ok(rows.length >= 2, 'db:init으로 시드를 준비하세요.');
  assert.deepEqual(data.map(({ ratingId, movieId, score, comment }) => ({ ratingId, movieId, score, comment })), rows.map((row) => ({ ratingId: Number(row.rating_id), movieId: Number(row.movie_id), score: row.score, comment: row.comment })));
  assert.deepEqual(Object.keys(data[0]).sort(), ['ratingId', 'movieId', 'score', 'comment', 'createdAt', 'updatedAt'].sort());
  assert.equal(typeof data[0].ratingId, 'number');
  assert.ok(Number.isFinite(Date.parse(data[0].createdAt)));
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5173');
});

test('실제 DB에 없는 회원은 404를 반환한다', async () => {
  const [{ nextId }] = await source.query('SELECT COALESCE(MAX(member_id), 0) + 1 AS nextId FROM member');
  assert.equal((await fetch(`${baseUrl}/members/${nextId}/ratings`)).status, 404);
});
