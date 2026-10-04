/**
 * public/ 에 있는 파일을 가리키는 경로를 만든다.
 *
 * Next 는 basePath 를 붙여 줄 때 next/image·next/link 만 손본다. 우리가 문자열로
 * 적은 <img src="/figma/..."> 같은 건 그대로 둬서, 하위 주소로 배포하면 도메인
 * 루트를 가리켜 404 가 난다. 그래서 여기서 직접 붙인다.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const asset = (p: string) => BASE + p;
