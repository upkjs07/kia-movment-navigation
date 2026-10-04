import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * 정적 서빙 전제. 지금 캠페인은 서버가 필요 없고, 현재 배포가 GitHub Pages 라
 * 그대로 쓸 수 있게 export 로 둔다. 서버 기능(API 라우트, 이미지 최적화)이
 * 필요해지면 이 설정부터 풀어야 한다.
 */
/* 하위 주소로 배포할 때 쓴다. 비워 두면 로컬 개발은 그대로 루트에서 돈다.
   NEXT_PUBLIC_ 접두사라 코드에서도 같은 값을 읽을 수 있다 — 아래 asset() 참고. */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },   // export 에서는 최적화 서버가 없다
  trailingSlash: true,             // Pages 의 정적 경로와 맞춘다
  // 홈 디렉토리에 떠도는 package-lock.json 을 루트로 오인하지 않도록 못박는다
  turbopack: { root: here },
};

export default nextConfig;
