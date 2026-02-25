# tapog.ai

`tapog.ai`는 크롬 탭을 `Group by AI` / `Group by Domain`으로 빠르게 묶는 Chrome Extension MVP입니다.

레퍼런스:
- Arc의 Tide 같은 자동 정리 경험
- Side Space의 Group by AI / Group Guard 같은 빠른 그룹핑 흐름

## 핵심 기능

- 팝업 버튼으로 `Group by AI`, `Group by Domain` 즉시 실행
- 사용자 지정 `키 + 클릭` 트리거
  - 예: `Alt + g` 누른 뒤 페이지 아무 곳이나 1회 클릭
- AI 카테고리 기반 분류 + 도메인 fallback
- Group Guard 규칙(우선 그룹)
  - 포맷: `그룹명|패턴1,패턴2|색상(옵션)`
  - 패턴은 Chrome match pattern(`https://*.domain.com/*`) 권장
- AI 모드에서 Group Guard 매칭 탭 제외 옵션(`Filter out grouped tabs`)
- 남는 단일 탭을 `Others` 그룹으로 묶는 옵션
- 크롬 명령 단축키(`chrome://extensions/shortcuts`)도 지원

## 설치 방법 (개발자 모드)

1. Chrome에서 `chrome://extensions` 열기
2. 우측 상단 `개발자 모드` 활성화
3. `압축해제된 확장 프로그램을 로드` 클릭
4. 이 폴더(`/Users/ho/code/tapog.ai`) 선택

## 사용 방법

1. 탭 여러 개를 연 상태에서 확장 팝업의 `Group by AI` 또는 `Group by Domain` 클릭
2. 또는 `Options`에서 트리거 키를 설정 후:
   - 트리거 키 조합 입력
   - 지정 시간 내(기본 4초) 페이지를 1회 클릭
3. `Options`에서 아래 항목을 조정
   - `Grouping mode` (AI / Domain)
   - `Group Guard Rules`
   - `AI Categories`
   - `Filter out grouped tabs`
4. 현재 창의 탭들이 카테고리별로 그룹 생성됨

## 현재 분류 카테고리 (MVP)

- AI, Dev, Work, Research, News, Social, Video, Shopping, Finance
- 규칙에 매칭되지 않으면 도메인 이름 기반 그룹

## 다음 단계 제안

- 실제 LLM 분류 연동 (OpenAI/Gemini API 키 연결)
- 사용자 카테고리 사전(키워드 룰) 커스텀 UI
- 그룹 제목 한국어/영어 자동 로컬라이즈
