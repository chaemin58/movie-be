import 'reflect-metadata';
import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import { FavoriteService } from '../dist/service/favorite.service.js';
import { RatingService } from '../dist/service/rating.service.js';
import { ApiException } from '../dist/exception/api.exception.js';

// Jest의 jest.fn() 대신 Node 내장 mock.fn()을 사용합니다.
const member = { memberId: 1 };
const members = () => ({ findOneBy: mock.fn(async () => member) });
const isApiError = (status, code) => (error) => {
  assert.ok(error instanceof ApiException);
  assert.equal(error.getStatus(), status);
  assert.equal(error.code, code);
  return true;
};

test('아직 즐겨찾기하지 않은 영화면 저장하고 영화 ID를 반환한다', async () => {
  // given: 회원이 존재하고 중복 즐겨찾기가 없습니다.
  const repository = {
    findOne: mock.fn(async () => null),
    create: mock.fn((value) => value),
    save: mock.fn(async (value) => ({ ...value, favoriteId: 1, createdAt: new Date() })),
  };
  const service = new FavoriteService(repository, members());
  // when
  const result = await service.create(1, { movieId: 550 });
  // then: 응답뿐 아니라 저장 호출도 확인합니다.
  assert.equal(result.movieId, 550);
  assert.equal(repository.save.mock.callCount(), 1);
  assert.deepEqual(repository.save.mock.calls[0].arguments[0], { member, movieId: 550 });
});

test('중복 즐겨찾기는 409와 FAVORITE409_1 예외를 던지고 저장하지 않는다', async () => {
  const repository = {
    findOne: mock.fn(async () => ({ favoriteId: 1 })),
    create: mock.fn((value) => value),
    save: mock.fn(async (value) => value),
  };
  const service = new FavoriteService(repository, members());
  await assert.rejects(service.create(1, { movieId: 550 }), isApiError(409, 'FAVORITE409_1'));
  assert.equal(repository.save.mock.callCount(), 0);
});

test('같은 영화의 평점을 중복 등록하면 409와 RATING409_1 예외를 던진다', async () => {
  const repository = {
    findOne: mock.fn(async () => ({ ratingId: 1 })),
    save: mock.fn(),
  };
  const service = new RatingService(repository, members());
  await assert.rejects(service.create(1, { movieId: 550, score: 5 }), isApiError(409, 'RATING409_1'));
  assert.equal(repository.save.mock.callCount(), 0);
});

test('남의 평점을 수정하면 403과 RATING403_1 예외를 던지고 저장하지 않는다', async () => {
  const rating = { ratingId: 1, member: { memberId: 2 }, score: 3 };
  const repository = { findOne: mock.fn(async () => rating), save: mock.fn() };
  const service = new RatingService(repository, members());
  await assert.rejects(service.update(1, 1, { score: 5 }), isApiError(403, 'RATING403_1'));
  assert.equal(repository.save.mock.callCount(), 0);
  assert.equal(rating.score, 3);
});
