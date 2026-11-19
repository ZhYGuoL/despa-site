# Despa site

Static landing page for Despa (English by default, Spanish toggle, `?lang=es` opens it in Spanish) with a waitlist.
Every shipment value on the page comes from the app's made-up sample set (Andes Juguetes SpA, BST-24117), not from a real customer.
No build step. Open `index.html` through any static server: `python3 -m http.server 8834`.

## Files

| File | What |
|---|---|
| `index.html` | The page. English text lives in the HTML; Spanish lives in `assets/site.js` (`ES`). |
| `assets/site.css` | Page modelled on Yucca Packaging (yucca.co.za, Awwwards Site of the Day, Jan 31 2026): warm paper, one deep ink, huge light Geist, a hero that stays while the page slides over it. One accent (`--accent`, container orange) used only for the container and the primary buttons. Result tones come from Tradecheck's `DESIGN.md`. |
| `assets/scene.js` | The 20 ft container in three.js (loaded from jsDelivr, pinned to 0.170.0). Scroll drives everything: it leaves the hero, is lowered onto the document band, opens its doors, and the four sample documents come out and line up. Positions come from `[data-anchor]` elements, so the layout lives in CSS. Door code `DSPU 241170` with its ISO 6346 check digit. `prefers-reduced-motion` keeps it in the hero. |
| `assets/yard.js` | The hero's back layer: a container yard in haze (three.js, its own canvas behind the headline). Fog to the sky colour, a ground plane in perspective, about 1,200 instanced boxes and four gantry cranes, seeded so it is the same every visit. The camera drifts a little with the pointer and with scroll; nothing moves on its own. A wash in `site.css` (`.hero::before`) keeps the headline on paper. |
| `assets/container.png` | Static render of the container, shown if WebGL or the CDN is unavailable, and used as the link preview image. Regenerate with `__despa.poster()` in the browser console. |
| `assets/site.js` | Language toggle (Spanish strings live here), header, scroll-linked marquee and cards, the document viewer in section 04, the supplier-message language switch and copy, the waitlist submit. |
| `assets/despa.mp4`, `assets/poster.jpg` | The launch video (78 s, 21 MB). Not on the page since the Nov 12 rebuild: it shows features that are not built. |
| `assets/Geist-*.woff2`, `assets/GeistMono-*.ttf` | Geist and Geist Mono (SIL Open Font License 1.1). |
| `assets/build-time.js` | Copy of the conductor skill's `<build-time>` element, with label attributes added for Spanish. |
| `build-time.json`, `build-time.en.json` | Build time data (Spanish and English section names). |

## Waitlist

Submissions go to the private Google Form "Despa waitlist" on zhiyuang2007@gmail.com
(form id `1l2bZ9E-CaHdRMBY4SI3uc3nE1Q6GIXq_cHSyzc_mvJU`), posted to its `formResponse` endpoint.
Every field is a short-answer question, so the page owns the role choices. Entry ids are at the top of `assets/site.js`.
If a question is renamed in the form, the ids stay the same; if one is deleted and re-added, update the id.

## Deploy (GitHub Pages)

1. Create an empty repository on GitHub (for example `despa-site`) and push: `git remote add origin git@github.com:ZhYGuoL/despa-site.git && git push -u origin main`.
2. In the repository: Settings > Pages > Source "Deploy from a branch", branch `main`, folder `/ (root)`.
3. Custom domain: buy `despa.ai`, then in Settings > Pages type `despa.ai` (this adds a `CNAME` file), and at the registrar add A records for `@` to 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 and a CNAME for `www` to `zhyguol.github.io`. Turn on "Enforce HTTPS" when the certificate is ready.
