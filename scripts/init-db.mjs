import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';

// package.json의 --env-file=.env 옵션이 먼저 환경변수를 읽어 줍니다.
const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const key of required) {
  if (process.env[key] === undefined) throw new Error(`.env에 ${key}를 입력하세요.`);
}

let connection;
try {
  connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    charset: 'utf8mb4',
    timezone: 'Z',
    // 직접 작성한 SQL 파일 실행에만 다중 문장을 허용합니다.
    multipleStatements: true,
  });
  const database = mysql.escapeId(process.env.DB_NAME);
  await connection.query(`CREATE DATABASE IF NOT EXISTS ${database} CHARACTER SET utf8mb4`);
  await connection.query(`USE ${database}`);
  await connection.query("SET time_zone = '+00:00'");
  await connection.query(await readFile(new URL('../sql/schema.sql', import.meta.url), 'utf8'));
  await connection.beginTransaction();
  await connection.query(await readFile(new URL('../sql/seed.sql', import.meta.url), 'utf8'));
  await connection.commit();
  const [members] = await connection.query('SELECT member_id, nickname FROM member ORDER BY member_id');
  console.log('테이블 및 시드 준비 완료. 평점 조회에 사용할 회원 번호:');
  console.table(members);
} catch (error) {
  if (connection) await connection.rollback();
  console.error('DB 초기화 실패:', error.code ?? error.message);
  process.exitCode = 1;
} finally {
  if (connection) await connection.end();
}
