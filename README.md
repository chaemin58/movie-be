# UMC 5주차 · 영화 평점 서비스

NestJS + TypeORM + MySQL로 워크북의 필수 API 3개와 실제 웹 화면을 구현했습니다.
프로젝트 위치: `D:\be\study\movie`

## 1. 이번 주에 구현한 것

| 기능 | 요청 | 성공 응답 |
| --- | --- | --- |
| 닉네임 중복 확인 | `GET /members/nickname/:nickname` | `{ "available": true 또는 false }` |
| 이메일 중복 확인 | `GET /members/email/:email` | `{ "available": true 또는 false }` |
| 회원별 평점 조회 | `GET /members/:memberId/ratings` | 평점 배열, ratingId 내림차순 |

평점이 없는 회원은 `200`과 `[]`, 없는 회원은 `404`를 반환합니다.
회원 번호에 숫자가 아닌 값을 넣으면 워크북의 `ParseIntPipe`가 `400`을 반환합니다.
`favorite`은 테이블만 생성합니다. 회원가입, 로그인, 평점 작성/수정/삭제, 즐겨찾기 API는 이후 주차 범위입니다.
선택 미션인 닉네임/이메일 형식 검증, 페이지네이션, CORS 와일드카드 비교 기능은 구현하지 않았습니다.

## 2. 폴더 구조

```text
movie/
├─ .env.example              # 접속 정보 작성 예시
├─ .env                      # 본인 PC의 실제 접속 정보, Git/보고서에서 제외
├─ package.json              # 패키지와 실행 명령
├─ package-lock.json         # 설치 버전 고정, npm이 생성
├─ nest-cli.json
├─ tsconfig.json
├─ tsconfig.build.json
├─ src/
│  ├─ main.ts                # 서버 시작
│  ├─ cors.ts                # 프론트 출처 허용
│  ├─ app.module.ts          # DB/컨트롤러/서비스 등록
│  ├─ controller/            # URL을 받아 서비스 호출
│  │  ├─ member.controller.ts
│  │  └─ rating.controller.ts
│  ├─ service/               # 존재 여부 확인 및 조회 처리
│  │  ├─ member.service.ts
│  │  └─ rating.service.ts
│  ├─ entity/                # MySQL 테이블과 연결되는 클래스
│  │  ├─ base-time.entity.ts
│  │  ├─ member.entity.ts
│  │  └─ rating.entity.ts
│  ├─ dto/                   # 응답 JSON 형태
│  │  ├─ check-response.dto.ts
│  │  └─ rating-response.dto.ts
│  └─ repository/README.md   # TypeORM 기본 Repository를 쓰는 이유
├─ sql/
│  ├─ schema.sql             # 세 테이블 생성
│  └─ seed.sql               # 회원 2명, 평점 3건
├─ scripts/
│  ├─ init-db.mjs            # DB 생성 + SQL 실행
│  └─ report.mjs             # 모든 작성 코드와 설명을 텍스트로 묶기
├─ mock-frontend/
│  ├─ index.html             # 버튼 세 개와 fetch 함수가 있는 간이 화면
│  └─ server.mjs             # 5173 포트 정적 서버
├─ test/
│  ├─ api.test.mjs           # DB 없이 HTTP 동작 검증
│  └─ mysql.test.mjs         # 실제 MySQL 통합 검증
├─ postman/umc-week5.postman_collection.json
└─ docs/
   ├─ 전체코드.md             # 파일별 설명과 전체 소스
   └─ 전체코드.txt            # 같은 내용을 일반 텍스트로 제공
```

## 3. 처음 실행하기 — Windows PowerShell

Node.js, npm, MySQL 서버가 설치되어 있어야 합니다.
현재 고정한 Nest CLI 의존성의 지원 범위는 Node.js 22.22.3 이상(22.x), 24.15.0 이상(24.x), 또는 26 이상입니다.
설치된 Node 22.20.0에서는 엔진 경고가 발생할 수 있으며, 실제 검증 결과는 `docs/검증결과.md`에 기록합니다.

**터미널 1에서 실행합니다.** 모든 npm 명령은 `movie` 폴더에서 실행하세요.

```powershell
cd D:\be\study\movie
npm.cmd ci

# .env가 아직 없는 경우에만 복사합니다. 이미 설정한 파일은 덮어쓰지 않습니다.
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

메모장에서 MySQL 접속 정보를 입력한 뒤 저장합니다.
`DB_PASSWORD`는 Windows 암호가 아니라 MySQL 계정의 암호입니다.
비밀번호에 `#` 등의 문자가 들어 있어도 읽을 수 있도록 큰따옴표로 감싸세요.

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USER=본인_MySQL_계정
DB_PASSWORD="본인_MySQL_비밀번호"
DB_NAME=umc_movie
PORT=3000
```

DB 계정에는 `umc_movie` 생성/테이블 생성/조회/시드 입력에 필요한 권한이 있어야 합니다.
그다음 같은 터미널에서 실행합니다.

```powershell
npm.cmd run db:init
npm.cmd run build
npm.cmd start
```

`db:init`은 DB와 세 테이블을 준비하고 시드를 넣습니다.
이미 같은 시드가 있으면 덮어쓰지 않습니다. 기존 테이블 구조를 변경하는 마이그레이션 기능은 아닙니다.
터미널에 표시된 회원 번호를 기억하세요. 빈 DB에서 처음 시작하면 수현은 1, 민서는 2입니다.

**터미널 2를 새로 열어 실행합니다.**

```powershell
cd D:\be\study\movie
npm.cmd run frontend
```

브라우저에서 **http://localhost:5173**을 엽니다.
`index.html`을 더블클릭해 열면 출처가 달라지므로 반드시 위 주소로 접속하세요.
닉네임 중복 확인, 이메일 중복 확인, 평점 조회 버튼을 각각 누릅니다.

서버를 종료하려면 각 터미널에서 `Ctrl+C`를 누릅니다.
개발 중 소스 변경을 자동 반영하려면 `npm.cmd start` 대신 `npm.cmd run start:dev`를 사용하세요.

## 4. 파일이 서로 연결되는 원리

```text
브라우저 mock-frontend/index.html의 script
 → HTTP GET 요청
 → Controller: URL의 값을 받음
 → Service: 회원 존재 여부 확인, 조회 조건 설정
 → TypeORM Repository: MySQL에 SQL 실행
 → DTO: 필요한 필드만 선택
 → JSON 응답
 → 화면에 JSON 응답 그대로 표시
```

- `MemberController`는 닉네임과 이메일 경로를 담당합니다.
- `MemberService`는 DB에 값이 있는지 `exists()`로 확인하고 결과를 반대로 뒤집습니다. 존재하면 `available: false`입니다.
- `RatingService`는 회원부터 확인합니다. 회원이 없으면 404, 있으면 그 회원의 평점만 최신순으로 조회합니다.
- `RatingResponseDto.from()`은 평점의 6개 필드만 골라 반환합니다. 회원 비밀번호나 내부 관계 객체는 응답하지 않습니다.
- `Member`와 `Rating`은 공통 날짜 클래스를 상속합니다. 날짜는 JSON으로 변환할 때 ISO 8601 문자열이 됩니다.
- `movieId`는 TMDB의 식별 번호를 담는 일반 컬럼입니다. 이번 화면에서는 JSON의 영화 번호를 그대로 표시하며 TMDB 호출/API Key는 필요 없습니다.
- DB의 날짜는 초기화 시 UTC로 기록하고, 응답은 `Z`가 붙는 UTC 시간입니다. 간이 화면은 JSON 응답을 그대로 표시합니다.
- SQL의 BIGINT ID를 API 명세에 맞춰 number로 반환합니다. 이 학습용 구현은 JavaScript 안전 정수 범위 안의 ID를 전제로 합니다.
- `repository` 폴더에 별도 클래스가 없는 이유는 NestJS에서 TypeORM의 기본 `Repository<T>`를 주입받기 때문입니다.
- `.ts` 코드의 내부 import 경로 끝에 `.js`가 붙은 것은 이 프로젝트가 ESM 방식이며 컴파일 후 실행 파일이 `.js`가 되기 때문입니다.
- 클래스 필드의 `!`는 TypeORM이 DB에서 값을 채운다는 것을 TypeScript에 알려주는 문법입니다.

## 5. API 확인 예시

아래 요청은 새 DB에 시드를 넣은 경우의 예시입니다.
한글 경로는 프론트가 `encodeURIComponent()`로 인코딩합니다. **닉네임을 큰따옴표로 감싸지 마세요.** 따옴표까지 검색 값에 포함됩니다.

```http
GET http://localhost:3000/members/nickname/수현
```

```json
{ "available": false }
```

```http
GET http://localhost:3000/members/email/noco@umc.com
```

```json
{ "available": false }
```

```http
GET http://localhost:3000/members/1/ratings
```

```json
[
  {
    "ratingId": 2,
    "movieId": 155,
    "score": 4,
    "comment": "다시 봐도 명작",
    "createdAt": "2026-10-28T00:00:00.000Z",
    "updatedAt": "2026-10-28T00:00:00.000Z"
  },
  {
    "ratingId": 1,
    "movieId": 550,
    "score": 5,
    "comment": "최고의 영화!",
    "createdAt": "2026-10-28T00:00:00.000Z",
    "updatedAt": "2026-10-28T00:00:00.000Z"
  }
]
```

위 날짜는 응답 형태를 보여주는 예시입니다. 실제 값은 시드를 넣은 시각입니다.

## 6. CORS 설정 전/후 실습

1. 실행 중인 백엔드 터미널에서 `Ctrl+C`를 누릅니다.
2. 아래 명령으로 CORS를 끈 백엔드를 실행합니다.

```powershell
npm.cmd run build
npm.cmd run start:no-cors
```

3. `http://localhost:5173`에서 F12 → Console을 열고 중복 확인 버튼을 누릅니다.
4. CORS 오류와 화면의 연결 실패 안내를 캡처합니다.
5. 백엔드를 `Ctrl+C`로 종료하고 `npm.cmd start`로 다시 실행합니다.
6. 같은 버튼을 누르면 정상 응답합니다. 다른 터미널의 프론트 서버는 계속 실행해 두면 됩니다.

기본 CORS 설정은 `src/cors.ts`에 있으며 `main.ts`에서 적용합니다.
허용 출처는 정확히 `http://localhost:5173`입니다. `127.0.0.1:5173`은 다른 출처입니다.
단순 GET은 서버가 처리해도 브라우저가 응답 읽기를 막을 수 있습니다.
Preflight가 필요한 요청은 사전 OPTIONS 요청이 실패하면 실제 요청이 전송되지 않을 수도 있습니다.
Postman과 Node의 fetch는 브라우저 CORS 정책을 적용하지 않으므로 브라우저 확인도 별도로 필요합니다.

## 7. 필수 인증 캡처하기

**Postman**

1. Import → `postman/umc-week5.postman_collection.json` 선택.
2. 닉네임, 이메일, 평점 요청을 각각 선택하고 Send.
3. 각 요청의 URL, HTTP 상태 코드, JSON 응답이 한 화면에 보이도록 캡처.
4. 기존 데이터가 있으면 컬렉션 변수 `memberId`를 `db:init`이 출력한 회원 번호로 변경.

**실제 웹 화면**

1. 닉네임 `수현`, 이메일 `noco@umc.com`의 중복 확인 버튼을 각각 클릭.
2. 회원 번호 `1`의 평점 조회 버튼 클릭(실제 시드 회원 번호가 다르면 수정).
3. 버튼 아래에 표시된 요청 주소·HTTP 상태 코드·JSON 확인.
4. 화면 결과와 요청 주소·HTTP 200·JSON을 함께 캡처.
5. CORS 설정 전/후 캡처도 함께 준비.

핵심 코드 제출에는 `entity`, `dto`, `controller`, `service` 파일을 사용합니다.
모든 작성 코드를 한 번에 읽으려면 `docs/전체코드.txt`를 사용하세요.

## 8. 테스트 및 보고서

```powershell
# 실제 DB 없이 라우팅, 응답, 400/404, CORS를 검사합니다.
npm.cmd test

# .env와 db:init이 준비된 실제 MySQL에서 조회를 검증합니다.
npm.cmd run test:mysql

# 수정된 소스 전체를 설명과 함께 텍스트로 다시 묶습니다.
npm.cmd run report
```

실제 DB 통합 테스트는 데이터를 삭제하거나 수정하지 않습니다.
`package-lock.json`은 npm이 자동 생성한 의존성 메타데이터이므로 전체 코드 보고서에는 복제하지 않습니다.
실제 `.env`의 비밀번호 역시 보고서에 넣지 않으며 `.env.example`로 설정 형식을 설명합니다.

## 9. 자주 생기는 문제

| 증상 | 확인할 것 |
| --- | --- |
| `ER_ACCESS_DENIED_ERROR` | 실제 `movie/.env`의 사용자·비밀번호, 저장 여부. `.env.example`만 수정하지 않았는지 확인 |
| `ECONNREFUSED` | MySQL 서버가 실행 중인지, DB_PORT가 맞는지 확인 |
| 테이블이 없다는 오류 | `npm.cmd run db:init` 실행 |
| `EADDRINUSE` | 3000 또는 5173을 사용 중인 기존 개발 서버 종료 |
| 화면에서 연결 실패 | 백엔드 실행 상태, 접속 주소가 `localhost:5173`인지, CORS 모드 확인 |
| `npm.ps1` 실행 정책 오류 | 가이드처럼 `npm.cmd`로 실행 |
| `EBADENGINE` 경고 | 위 Node.js 지원 버전 확인 |

서버 포트를 변경한다면 `.env`의 `PORT`, `mock-frontend/index.html`의 `API_BASE`, Postman의 `baseUrl`을 함께 변경하세요.
