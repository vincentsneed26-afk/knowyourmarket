# Know Your Market — Website

A standalone, framework-free static website. Plain HTML, CSS and vanilla
JavaScript — no build step, no dependencies. Open `index.html` in any browser,
or deploy the folder as-is.

## Pages
| File | Page |
|------|------|
| `index.html` | Home |
| `about.html` | About |
| `services.html` | Services |
| `results.html` | Results |
| `clients.html` | Clients |
| `book-a-demo.html` | Book a Demo (working contact form) |

## Structure
```
.
├── index.html, about.html, … (one file per page)
├── css/        one stylesheet per page (reset + responsive rules)
├── js/site.js  shared behaviour: sticky nav, scroll reveal,
│               hover states, mobile menu, demo-form validation
└── assets/     logos, favicon, and images (assets/img/)
```

## Run locally
Open `index.html` directly, or serve the folder:
```bash
python3 -m http.server
# then visit http://localhost:8000
```

## Deploy to GitHub Pages
1. Create a repository and push the contents of this folder to the default branch.
2. In **Settings → Pages**, set the source to that branch, root folder.
3. Your site goes live at `https://<user>.github.io/<repo>/`.

The empty `.nojekyll` file tells GitHub Pages to serve every file verbatim.

## Notes
- Fonts (Montserrat) load from Google Fonts.
- The Book a Demo form posts to [Web3Forms](https://web3forms.com) and falls
  back to a `mailto:` link. Replace the access key in `js/site.js` to point it
  at your own inbox.
- Image placeholders (team photo, client logos) show labelled drop-zones where
  no image was supplied yet — drop in real images by replacing files in
  `assets/img/` and pointing the relevant `<img>`/placeholder at them.
