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
- Logo source images: `img/`
- Web Store docs: `docs/`

## Install From GitHub ZIP

1. Download the latest source ZIP from GitHub:
   - <https://github.com/HOYALIM/tapog.ai/archive/refs/heads/main.zip>
2. Unzip the archive.
3. Open `chrome://extensions`.
4. Turn on `Developer mode`.
5. Click `Load unpacked`.
6. Select the unzipped `tapog.ai-main` folder.

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
