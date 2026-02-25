# Step 3 - Store Listing Ready (tapog.ai)

Updated: February 25, 2026

## Product details

### Name
`tapog.ai`

### Category
`Productivity`

### Language
`English` and `Korean`

### Short description (EN)
Group Chrome tabs instantly by AI or by domain, with custom key+click and guard rules.

### Short description (KO)
AI 또는 도메인 기준으로 크롬 탭을 즉시 그룹화하고, 키+클릭과 가드 룰로 제어하세요.

### Detailed description (EN)
`tapog.ai` turns tab chaos into clean structure in one action.

- Group by AI: classify tabs into practical categories.
- Group by Domain: deterministic grouping by registrable domain.
- Group Guard: force specific URL patterns into dedicated groups.
- Custom Trigger: run grouping with your own key + click.

No remote API calls. Tab URL/title are processed locally.

### Detailed description (KO)
`tapog.ai`는 복잡한 탭을 한 번의 액션으로 정리합니다.

- Group by AI: 탭을 실용적인 카테고리로 분류
- Group by Domain: 도메인 기반의 예측 가능한 그룹화
- Group Guard: 특정 URL 패턴을 원하는 그룹으로 고정
- Custom Trigger: 사용자 키 + 클릭으로 즉시 실행

원격 API 호출 없이 로컬에서 URL/제목 기반으로 동작합니다.

## Graphic assets checklist
- [x] Store icon 128x128: `assets/icons/icon128.png`
- [ ] Screenshot 1280x800: at least 1, up to 5
- [ ] YouTube promo video URL
- [ ] Small promo tile 440x280 (PNG/JPEG)
- [ ] Marquee promo tile 1400x560 (optional)

## Reviewer notes
```text
How to test:
1) Open multiple tabs from different domains.
2) Click extension icon -> Group by Domain.
3) Re-open mixed tabs and click Group by AI.
4) Add Group Guard rule in Options:
   Work|https://*.notion.so/*,https://*.atlassian.net/*|blue
5) Run Group by AI and verify the Work group behavior.

No external API is used. Tab metadata is processed locally.
```
