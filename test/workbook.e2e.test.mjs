import 'reflect-metadata';
import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import { ValidationPipe } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { getMetadataArgsStorage } from 'typeorm';
import { Member } from '../dist/entity/member.entity.js';
import { Favorite } from '../dist/entity/favorite.entity.js';
import { Rating } from '../dist/entity/rating.entity.js';
import { FavoriteController } from '../dist/controller/favorite.controller.js';
import { RatingController } from '../dist/controller/rating.controller.js';
import { FavoriteService } from '../dist/service/favorite.service.js';
import { RatingService } from '../dist/service/rating.service.js';
import { HttpExceptionFilter } from '../dist/filter/http-exception.filter.js';

let app, baseUrl, favorites, ratings, member, authorization;
const changedColumns = [];

before(async () => {
  // SQLite 자동 증가 PK는 integer만 허용합니다. 테스트 프로세스에서만
  // MySQL bigint/tinyint를 매핑하고 운영 엔티티·개발 DB는 바꾸지 않습니다.
  for (const column of getMetadataArgsStorage().columns) {
    if (['bigint', 'tinyint'].includes(column.options.type)) {
      changedColumns.push([column, column.options.type]);
      column.options.type = 'integer';
    }
  }
  const module = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'sqljs', autoSave: false, entities: [Member, Favorite, Rating],
        synchronize: true, retryAttempts: 0,
      }),
      TypeOrmModule.forFeature([Member, Favorite, Rating]),
      JwtModule.register({ global: true, secret: 'workbook-test-only-secret', signOptions: { expiresIn: 3600 } }),
    ],
    controllers: [FavoriteController, RatingController],
    providers: [FavoriteService, RatingService],
  }).compile();
  app = module.createNestApplication({ logger: false });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(0, '127.0.0.1');
  baseUrl = await app.getUrl();
  favorites = module.get(getRepositoryToken(Favorite));
  ratings = module.get(getRepositoryToken(Rating));
  const members = module.get(getRepositoryToken(Member));
  member = await members.save(members.create({ email: 'test@umc.com', password: 'unused-test-password', nickname: '테스트회원' }));
  authorization = `Bearer ${module.get(JwtService).sign({ sub: String(member.memberId), email: member.email })}`;
});

beforeEach(async () => {
  await favorites.clear();
  await ratings.clear();
});
after(async () => {
  await app?.close();
  for (const [column, type] of changedColumns) column.options.type = type;
});

async function post(path, body, authenticated = true) {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(authenticated ? { Authorization: authorization } : {}) },
    body: JSON.stringify(body),
  });
}

test('토큰 없이 즐겨찾기를 등록하면 401과 AUTH401_2를 응답한다', async () => {
  const response = await post('/favorites', { movieId: 550 }, false);
  assert.equal(response.status, 401);
  const body = await response.json();
  assert.equal(body.isSuccess, false);
  assert.equal(body.code, 'AUTH401_2');
  assert.equal(await favorites.count(), 0);
});

test('토큰으로 즐겨찾기를 등록하면 201과 영화 ID를 응답하고 DB에 저장한다', async () => {
  const response = await post('/favorites', { movieId: 550 });
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.code, 'COMMON201');
  assert.equal(body.result.movieId, 550);
  assert.equal(await favorites.countBy({ member: { memberId: member.memberId }, movieId: 550 }), 1);
});

test('중복 즐겨찾기를 등록하면 409와 FAVORITE409_1을 응답한다', async () => {
  await favorites.save(favorites.create({ member, movieId: 550 }));
  const response = await post('/favorites', { movieId: 550 });
  assert.equal(response.status, 409);
  assert.equal((await response.json()).code, 'FAVORITE409_1');
  assert.equal(await favorites.count(), 1);
});

test('즐겨찾기하지 않은 영화 조회는 200과 isFavorite false를 응답한다', async () => {
  const response = await fetch(`${baseUrl}/favorites/550`, { headers: { Authorization: authorization } });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).result.isFavorite, false);
});

test('토큰 없이 평점을 등록하면 401과 AUTH401_2를 응답한다', async () => {
  const response = await post('/ratings', { movieId: 550, score: 5 }, false);
  assert.equal(response.status, 401);
  assert.equal((await response.json()).code, 'AUTH401_2');
  assert.equal(await ratings.count(), 0);
});

test('토큰으로 평점을 등록하면 201과 COMMON201을 응답하고 DB에 저장한다', async () => {
  const response = await post('/ratings', { movieId: 550, score: 5, comment: '좋아요' });
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.code, 'COMMON201');
  assert.equal(body.result.movieId, 550);
  assert.equal(body.result.score, 5);
  assert.equal(await ratings.countBy({ member: { memberId: member.memberId }, movieId: 550 }), 1);
});
