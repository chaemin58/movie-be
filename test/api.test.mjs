import 'reflect-metadata';
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Member } from '../dist/entity/member.entity.js';
import { Rating } from '../dist/entity/rating.entity.js';
import { MemberService } from '../dist/service/member.service.js';
import { RatingService } from '../dist/service/rating.service.js';
import { MemberController } from '../dist/controller/member.controller.js';
import { RatingController } from '../dist/controller/rating.controller.js';
import { configureCors } from '../dist/cors.js';

// 실제 MySQL 없이 HTTP 라우팅, 응답 계약, 오류 처리, CORS를 검증합니다.
const members = [{ memberId: 1, nickname: '수현', email: 'noco@umc.com' }, { memberId: 2, nickname: '민서', email: 'minseo@umc.com' }];
const ratings = [{ ratingId: 2, movieId: 155, score: 4, comment: null, createdAt: new Date('2026-01-02T00:00:00Z'), updatedAt: new Date('2026-01-02T00:00:00Z'), internal: '응답에서 제외' }];
const memberRepository = {
  exists: async ({ where }) => members.some((member) => Object.entries(where).every(([key, value]) => member[key] === value)),
};
const ratingRepository = { find: async ({ where }) => where.member.memberId === 1 ? ratings : [] };
const apps = [];
let baseUrl;

async function createApp(cors) {
  const module = await Test.createTestingModule({
    controllers: [MemberController, RatingController],
    providers: [MemberService, RatingService,
      { provide: getRepositoryToken(Member), useValue: memberRepository },
      { provide: getRepositoryToken(Rating), useValue: ratingRepository },
    ],
  }).compile();
  const app = module.createNestApplication({ logger: false });
  configureCors(app, cors);
  await app.listen(0, '127.0.0.1');
  apps.push(app);
  return app.getUrl();
}

before(async () => { baseUrl = await createApp(true); });
after(async () => { await Promise.all(apps.map((app) => app.close())); });

test('닉네임: 기존 값 false, 새 값 true, 한글 경로 인코딩', async () => {
  for (const [nickname, available] of [['수현', false], ['새로운회원', true]]) {
    const response = await fetch(`${baseUrl}/members/nickname/${encodeURIComponent(nickname)}`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { available });
  }
});

test('이메일: 기존 값 false, 새 값 true', async () => {
  for (const [email, available] of [['noco@umc.com', false], ['new@example.com', true]]) {
    const response = await fetch(`${baseUrl}/members/email/${encodeURIComponent(email)}`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { available });
  }
});

test('평점 응답은 명세의 6개 필드만 노출하고 null과 날짜를 보존한다', async () => {
  const response = await fetch(`${baseUrl}/members/1/ratings`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), [{ ratingId: 2, movieId: 155, score: 4, comment: null, createdAt: '2026-01-02T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z' }]);
});

test('평점 없는 회원은 200과 빈 배열', async () => {
  const response = await fetch(`${baseUrl}/members/2/ratings`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), []);
});

test('없는 회원은 404, 숫자가 아닌 회원 번호는 400', async () => {
  const missing = await fetch(`${baseUrl}/members/999/ratings`);
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).message, '존재하지 않는 유저입니다.');
  assert.equal((await fetch(`${baseUrl}/members/abc/ratings`)).status, 400);
});

test('허용 출처에 CORS 응답 헤더와 preflight 응답을 제공한다', async () => {
  const response = await fetch(`${baseUrl}/members/1/ratings`, { headers: { Origin: 'http://localhost:5173' } });
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  const preflight = await fetch(`${baseUrl}/members/1/ratings`, { method: 'OPTIONS', headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'GET' } });
  assert.equal(preflight.status, 204);
  assert.match(preflight.headers.get('access-control-allow-methods'), /GET/);
});

test('다른 출처를 허용하지 않고 CORS 끄기 모드에서는 허용 헤더가 없다', async () => {
  const response = await fetch(`${baseUrl}/members/1/ratings`, { headers: { Origin: 'http://example.com' } });
  assert.notEqual(response.headers.get('access-control-allow-origin'), 'http://example.com');
  const noCorsUrl = await createApp(false);
  const noCors = await fetch(`${noCorsUrl}/members/1/ratings`, { headers: { Origin: 'http://localhost:5173' } });
  assert.equal(noCors.headers.get('access-control-allow-origin'), null);
});
