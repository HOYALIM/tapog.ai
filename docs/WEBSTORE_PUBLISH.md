# Chrome Web Store Publish Guide (tapog.ai)

Last updated: February 25, 2026

## 0) Do we need a separate website?
Short answer: **No, not required for publication.**

- In Chrome Web Store listing info, `Official URL` is marked as **Optional**.
- You can publish without a product website.
- A simple website is still recommended for credibility and user trust.

For this project, you can proceed with:
- No website (publish directly), or
- GitHub Pages later (recommended)

## 1) Create upload zip
Run:

```bash
bash scripts/package-webstore.sh
```

Output example:

```bash
dist/tapog.ai-0.1.0.zip
```

## 2) Open Chrome Web Store Developer Dashboard
- URL: https://chrome.google.com/webstore/devconsole
- Add new item -> upload the generated zip.

## 3) Store listing fields
Use these values as a starting point.

### Name
`tapog.ai`

### Short description
Group tabs instantly by AI or domain with custom key+click.

### Full description
`tapog.ai` helps you clean up tab chaos in one action.

- Group by AI: classify tabs into meaningful categories with customizable rules.
- Group by Domain: group tabs by registrable domain for deterministic organization.
- Group Guard: force tabs that match your patterns into dedicated groups.
- Custom trigger: set your own key combination, then click once to group.

Built for fast, keyboard-friendly tab management.

### Category
Productivity

### Language
English and Korean

## 4) Privacy and permissions form
Recommended answers based on current implementation:

- Data sale: No
- Data use for creditworthiness/lending: No
- Host permission rationale: Required to detect key+click trigger across pages and classify open tabs.
- Tabs data handling: Processed locally for grouping logic only.

Privacy policy URL:
- https://raw.githubusercontent.com/HOYALIM/tapog.ai/main/PRIVACY_POLICY.md

## 5) Assets to prepare in dashboard
- Extension icon: `assets/icons/icon128.png`
- Screenshots: popup, options, grouped tabs view
- Promotional assets: small promo tile + YouTube video (prepare if dashboard requires them)

## 6) Reviewer notes (paste into notes)
Use this text:

```text
How to test:
1) Open multiple tabs from different domains (e.g., github.com, notion.so, youtube.com).
2) Click extension icon -> Group by Domain.
3) Re-open mixed tabs and click Group by AI.
4) Open Options and add Group Guard rule:
   Work|https://*.notion.so/*,https://*.atlassian.net/*|blue
5) Run Group by AI again and verify rule-matched tabs are grouped under Work.

No external API is used. Tab metadata is processed locally.
```

## 7) Submit
- Save draft
- Resolve policy checklist
- Submit for review
