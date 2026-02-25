# tapog.ai

`tapog.ai`는 Chrome 탭을 `Group by AI` / `Group by Domain`으로 빠르게 묶는 확장 프로그램입니다.

## Features

- Group by AI: 카테고리 기반 자동 그룹핑
- Group by Domain: 도메인 기반 결정적 그룹핑
- Group Guard: 특정 URL 패턴 우선 그룹 처리
- Custom trigger: 개인 설정 키 + 클릭으로 즉시 실행
- Local-first: 원격 API 호출 없이 로컬 처리

## Project paths

- Extension source: `src/`
- Landing page: `site/`
- Branding source: `branding/source/`
- Web Store docs: `docs/`

## Run / Load

1. Chrome에서 `chrome://extensions` 열기
2. `개발자 모드` ON
3. `압축해제된 확장 프로그램을 로드`
4. `/Users/ho/code/tapog.ai` 선택

## Package for Web Store

```bash
bash scripts/package-webstore.sh
```

Generated zip:
- `dist/tapog.ai-0.1.0.zip`
