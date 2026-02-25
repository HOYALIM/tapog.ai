# Chrome Web Store Publish Guide (tapog.ai)

Last updated: February 25, 2026

## 0) Do we need a separate website?
Short answer: **No, not required for publication.**

- In Chrome Web Store listing info, `Official URL` is marked as optional.
- You can publish without a product website.
- A simple website is still recommended for trust and conversion.

This repo now includes a landing page at `site/`.

## 1) (Optional but recommended) Publish website
- Source: `site/`
- GitHub Actions workflow: `.github/workflows/deploy-site.yml`
- Expected URL: `https://hoyalim.github.io/tapog.ai/`

After first push, enable GitHub Pages in repository settings if prompted.

## 2) Dashboard setup (ready)
Use: `docs/store/STEP2_DASHBOARD_READY.md`

## 3) Listing content (ready)
Use: `docs/store/STEP3_LISTING_READY.md`

Extra copy pack:
- `docs/WEBSTORE_LISTING_COPY.md`

## 4) Create upload zip
Run:

```bash
bash scripts/package-webstore.sh
```

Output example:

```bash
dist/tapog.ai-0.1.0.zip
```

## 5) Privacy and permissions
- Privacy policy URL:
  `https://raw.githubusercontent.com/HOYALIM/tapog.ai/main/PRIVACY_POLICY.md`

## 6) Submit
- Upload zip in Dev Console
- Fill listing + privacy sections
- Attach screenshots/promo assets
- Add reviewer notes
- Submit for review
