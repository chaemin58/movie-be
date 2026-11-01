import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

// 외부 패키지 없이 index.html만 제공하는 로컬 정적 서버입니다.
const files = {
  '/': ['index.html', 'text/html; charset=utf-8'],
};

const server = createServer(async (request, response) => {
  const path = new URL(request.url, 'http://localhost:5173').pathname;
  const file = files[path];
  if (!file || !['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(404).end('Not found');
    return;
  }
  try {
    const body = await readFile(new URL(file[0], import.meta.url));
    response.writeHead(200, { 'Content-Type': file[1], 'Cache-Control': 'no-store' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(500).end('Cannot read frontend file');
  }
});

server.listen(5173, 'localhost', () => console.log('간이 프론트: http://localhost:5173'));
