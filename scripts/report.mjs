import { readFile, writeFile, mkdir } from 'node:fs/promises';

// 비밀번호가 있는 .env와 설치/빌드 산출물은 목록에 넣지 않습니다.
const files = [
  ['package.json', '패키지 버전과 실행 명령어를 정의합니다.'],
  ['.gitignore', '비밀번호, 설치 결과, 빌드 결과를 Git에서 제외합니다.'],
  ['.env.example', 'DB 접속 설정의 작성 예시입니다. 실제 비밀번호는 .env에만 저장합니다.'],
  ['nest-cli.json', 'Nest CLI가 읽을 소스 폴더와 빌드 설정입니다.'],
  ['tsconfig.json', 'TypeScript와 ESM, 데코레이터 메타데이터를 설정합니다.'],
  ['tsconfig.build.json', '빌드에서 테스트와 화면 파일을 제외합니다.'],
  ['src/main.ts', 'Nest 앱 생성 → CORS 적용 → 3000 포트 실행 순서입니다.'],
  ['src/cors.ts', 'localhost:5173 화면이 응답을 읽도록 허용합니다. 설정 전/후 실습을 위해 끌 수 있습니다.'],
  ['src/app.module.ts', '.env를 읽고 MySQL, TypeORM 저장소, 컨트롤러와 서비스를 연결합니다.'],
  ['src/entity/base-time.entity.ts', '생성일과 수정일을 공통 부모 클래스로 정의합니다.'],
  ['src/entity/member.entity.ts', 'member 테이블을 연결합니다. password는 일반 조회에서 제외합니다.'],
  ['src/entity/rating.entity.ts', 'rating 테이블, 회원 외래키, 회원·영화 복합 UNIQUE를 정의합니다.'],
  ['src/dto/check-response.dto.ts', '두 중복 확인 API의 available 응답입니다.'],
  ['src/dto/rating-response.dto.ts', '평점 엔티티에서 명세에 필요한 6개 필드만 선택합니다.'],
  ['src/controller/member.controller.ts', '닉네임과 이메일 경로 변수를 받아 서비스에 전달합니다.'],
  ['src/controller/rating.controller.ts', '회원 번호를 정수로 바꾸어 평점 서비스를 호출합니다.'],
  ['src/service/member.service.ts', 'exists()로 DB에 값이 있는지 확인하고 available로 바꿉니다.'],
  ['src/service/rating.service.ts', '회원 존재 확인 후 해당 회원의 평점을 최신순으로 반환합니다.'],
  ['src/repository/README.md', '별도 저장소 클래스 대신 TypeORM Repository를 사용하는 이유입니다.'],
  ['sql/schema.sql', '회원, 평점, 즐겨찾기 테이블과 관계/중복 제약을 만듭니다.'],
  ['sql/seed.sql', '워크북의 회원 2명과 평점 3건을 중복 없이 추가합니다.'],
  ['scripts/init-db.mjs', '.env로 연결해 DB/테이블/시드를 준비하고 실제 회원 번호를 출력합니다.'],
  ['mock-frontend/index.html', '꾸밈없는 HTML에 버튼 세 개와 fetch 함수를 넣어 필수 API의 실제 응답을 표시합니다.'],
  ['mock-frontend/server.mjs', 'Node 내장 HTTP 기능으로 간이 화면을 5173 포트에서 제공합니다.'],
  ['test/api.test.mjs', 'DB 대역을 사용해 HTTP 응답 계약과 CORS, 오류 상태를 검증합니다.'],
  ['test/mysql.test.mjs', '실제 MySQL에서 회원 필터링과 정렬, DTO와 404를 검증합니다.'],
  ['postman/umc-week5.postman_collection.json', 'Postman에 가져와 필수 요청과 404 확인을 실행합니다.'],
  ['README.md', '폴더 구조, 실행 명령, 코드 흐름, 인증 방법과 오류 해결 가이드입니다.'],
  ['docs/검증결과.md', '실제로 수행한 검사와 남은 확인 사항을 기록합니다.'],
  ['scripts/report.mjs', '이 보고서를 만드는 스크립트 자체도 전체 코드로 포함합니다.'],
];

let report = '# UMC 5주차 — 추가한 전체 코드와 파일별 설명\n\n';
report += '기준 경로: D:/be/study/movie/\n\n';
report += '필수 API 3개, MySQL 스키마/시드, CORS, 실제 화면과 검증 코드를 작성했습니다. 선택 미션은 제외했습니다.\n\n';
report += '아래는 작성한 파일의 전체 내용입니다. 실제 .env는 비밀번호 보호를 위해 제외하고 .env.example로 대체합니다. ';
report += 'npm이 생성한 package-lock.json, node_modules, dist와 보고서 자체의 중복 사본은 복제하지 않습니다.\n\n';
for (const [path, description] of files) {
  const source = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
  const extension = path.split('.').pop();
  const language = ({ ts: 'typescript', mjs: 'javascript', js: 'javascript', json: 'json', html: 'html', css: 'css', sql: 'sql', md: 'markdown' })[extension] ?? 'text';
  // 원본에 포함된 Markdown 코드 블록과 충돌하지 않도록 더 긴 울타리를 사용합니다.
  const fence = '`'.repeat(Math.max(4, ...[...source.matchAll(/`+/g)].map((match) => match[0].length + 1)));
  report += `## ${path}\n\n경로: D:/be/study/movie/${path}\n\n설명: ${description}\n\n${fence}${language}\n${source.trimEnd()}\n${fence}\n\n`;
}
await mkdir(new URL('../docs/', import.meta.url), { recursive: true });
await writeFile(new URL('../docs/전체코드.md', import.meta.url), report.trimEnd() + '\n', 'utf8');
await writeFile(new URL('../docs/전체코드.txt', import.meta.url), report.trimEnd() + '\n', 'utf8');
console.log(`${files.length}개 파일의 설명과 전체 코드를 docs/전체코드.md, docs/전체코드.txt에 기록했습니다.`);
