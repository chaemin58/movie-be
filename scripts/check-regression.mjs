import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

// 원본 TS 대신 빌드 산출물만 잠깐 변경하고 finally에서 반드시 복원합니다.
// 실행 전 npm run build가 필요하며, watch 빌드와 동시에 실행하지 마세요.
const target = new URL('../dist/service/favorite.service.js', import.meta.url);
const original = readFileSync(target, 'utf8');
const marker = 'if (existing) {';
if (!original.includes(marker)) throw new Error('중복 검사 위치를 찾지 못했습니다.');
try {
  writeFileSync(target, original.replace(marker, 'if (false && existing) {'));
  const result = spawnSync(process.execPath, [
    '--test', '--test-reporter=tap', '--test-name-pattern=중복 즐겨찾기',
    'test/service.unit.test.mjs', 'test/workbook.e2e.test.mjs',
  ], { encoding: 'utf8', cwd: new URL('..', import.meta.url) });
  const output = (result.stdout ?? '') + (result.stderr ?? '');
  writeFileSync(new URL('../docs/week9-regression-failure.txt', import.meta.url), output);
  process.stdout.write(output);
  if (result.status !== 1 || !output.includes('# fail 2')) {
    throw new Error('예상한 중복 테스트 2개의 실패인지 결과를 확인하세요.');
  }
  console.log('중복 검사 제거 시 단위·통합 테스트 2개 실패를 확인했습니다.');
} finally {
  writeFileSync(target, original);
  console.log('중복 검사 코드를 원래대로 복원했습니다.');
}
