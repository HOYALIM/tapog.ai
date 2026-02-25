# tapog.ai

`tapog.ai` is a Chrome extension that groups tabs quickly with `Group by AI` and `Group by Domain`.

## Features

- Group by AI: weighted classification (domain + title + URL intent signals)
- Group by Domain: deterministic grouping by registrable domain
- Group Guard: prioritize tabs that match your URL rules
- Expanded built-in taxonomy: AI, Dev, Cloud, Work, Docs, Design, Comms, Research, Learning, News, Social, Video, Shopping, Finance, Marketing, Travel
- Undo Last Grouping: restore tabs to the layout right before the most recent grouping action
- Custom trigger: run instantly with your own key + click combo
- Local-first: no remote API calls, tab data is processed on-device

## Project Structure

- Extension source: `src/`
- Landing page: `site/`
- Branding source: `branding/source/`
- Web Store docs: `docs/`

## Load Locally (Chrome)

1. Open `chrome://extensions`
2. Turn on `Developer mode`
3. Click `Load unpacked`
4. Select `/Users/ho/code/tapog.ai`

## Package for Web Store

```bash
bash scripts/package-webstore.sh
```

Generated zip:
- `dist/tapog.ai-0.1.0.zip`

## Tests

```bash
bash scripts/run-tests.sh
```

## Inspiration / References

- [Arc Browser](https://arc.net/) (Tidy Tabs UX inspiration)
- [Side Space](https://sidespace.app/) (Group by AI / Group Guard workflow inspiration)

This project is independently implemented and not affiliated with Arc or Side Space.
