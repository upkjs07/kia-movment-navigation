import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Chivo_Mono, Jersey_20 } from 'next/font/google';
import './globals.css';

/* 기아 시그니처. source/2021 기아 시그니처 폰트 OTF 를 woff2 로 구운 것
   (scripts/build-fonts.py). 한글이라 한 벌이 400KB 넘어서 preload 는 끈다 —
   먼저 대체 글꼴로 보여 주고 도착하면 바꿔 끼운다(display: swap).
   fallback 을 적어 두면 Next 가 대체 글꼴의 자간·높이를 맞춰 줘서 바뀔 때 덜 튄다. */
const kia = localFont({
  src: [
    { path: '../fonts/KiaSignature-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/KiaSignature-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-kia',
  display: 'swap',
  preload: false,
  fallback: ['Pretendard', 'Noto Sans KR', 'system-ui', 'sans-serif'],
});

/* 결과 카드(Figma 82:3)가 쓰는 두 서체. 빌드 때 내려받아 같이 배포되므로
   런타임에 외부 요청이 없다. */
const chivo = Chivo_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-mono' });
const jersey = Jersey_20({ subsets: ['latin'], weight: '400', variable: '--font-pixel' });

export const metadata: Metadata = {
  title: 'Movement Navigator',
  description: '2026년을 돌아보고 2027년의 방향을 찾는 9개의 질문',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${kia.variable} ${chivo.variable} ${jersey.variable}`}>
      <body>{children}</body>
    </html>
  );
}
