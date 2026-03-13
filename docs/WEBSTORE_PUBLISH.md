# Chrome Web Store Publish Guide (tapog.ai)

Last updated: March 12, 2026

## 1) Prerequisites

- Chrome Web Store developer account
- One-time developer registration fee paid in the Chrome Web Store Developer Dashboard
- Product website (optional but recommended):
  `https://tapogai.vercel.app`

## 2) Package the extension

Run:

```bash
bash scripts/package-webstore.sh
```

Output example:

```bash
dist/tapog.ai-0.1.0.zip
```

The uploaded ZIP must contain `manifest.json` at the root of the archive.

## 3) Dashboard and listing copy

Use:

- `docs/store/STEP2_DASHBOARD_READY.md`
- `docs/store/STEP3_LISTING_READY.md`
- `docs/WEBSTORE_LISTING_COPY.md`

## 4) Privacy and product URLs

- Privacy policy URL:
  `https://raw.githubusercontent.com/HOYALIM/tapog.ai/main/PRIVACY_POLICY.md`
- Product website:
  `https://tapogai.vercel.app`

## 5) Image assets ready for the dashboard

- Screenshot:
  `docs/store-assets/screenshot-1.png`
- Small promo tile:
  `docs/store-assets/small-promo-tile.png`
- Marquee image:
  `docs/store-assets/marquee-promo-tile.png`
- Screenshot size requirement: `1280x800` or `640x400`
- Small promo tile size requirement: `440x280`
- Marquee image size requirement: `1400x560`

## 6) Submit for review

Official dashboard flow:

1. Open the Chrome Web Store Developer Dashboard
2. Click `Add new item`
3. Upload the ZIP file
4. Fill out `Store Listing`, `Privacy`, `Distribution`, and `Test instructions` if needed
5. Click `Submit for review`
