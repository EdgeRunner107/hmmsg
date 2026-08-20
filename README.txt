사용 순서

1. 프로젝트 폴더에서:
npm install

2. .env.example 파일을 복사해서 .env 파일 생성

3. .env 내용:
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY

4. 실행:
npm run dev

페이지
/hyukmin  = 혁민 메시지 입력
/iroi     = 이로이 메시지 입력
/display  = 통합 메시지 표시

Supabase messages 테이블 컬럼
id
sender
message
created_at

sender 값
혁민
이로이
